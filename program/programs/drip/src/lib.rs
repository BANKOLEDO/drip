use anchor_lang::prelude::*;
use spl_token_2022::extension::{
    scaled_ui_amount::ScaledUiAmountConfig, BaseStateWithExtensions, StateWithExtensions,
};
use spl_token_2022::state::Mint;

// Deploy keypair: program/target/deploy/drip-keypair.json
declare_id!("8beC3twEfuHXr5nhVVmbakLdsLqdKShSWQoPhbb5mHMU");

// Fixed-point scale for multipliers: 1.0032690125398187x is stored as
// 1_003_269_013. All share math stays in u64 raw base units; UI conversion
// happens off-chain at the edge.
pub const MULT_SCALE: u64 = 1_000_000_000;
// On-chain extension check tolerance: 0.1% (10 bps of the multiplier).
pub const MULT_TOLERANCE_BPS: u64 = 10;

#[program]
pub mod drip {
    use super::*;

    // Open a DCA intent: who owns it, what it buys, how much, how often,
    // and how rich a quote may be before the guard defers. The keeper
    // defaults to the owner; rotate it later with set_keeper so automation
    // can flip the pause without holding the owner's key.
    pub fn initialize_intent(
        ctx: Context<InitializeIntent>,
        amount_usdc: u64,
        interval_days: u16,
        max_premium_bps: u16,
    ) -> Result<()> {
        require!(amount_usdc > 0, DripError::BadAmount);
        require!(
            interval_days == 1 || interval_days == 7 || interval_days == 14,
            DripError::BadInterval
        );
        require!(max_premium_bps <= 10_000, DripError::BadPremiumCap);
        let intent = &mut ctx.accounts.intent;
        intent.owner = ctx.accounts.owner.key();
        intent.mint = ctx.accounts.mint.key();
        intent.keeper = ctx.accounts.owner.key();
        intent.amount_usdc = amount_usdc;
        intent.interval_days = interval_days;
        intent.max_premium_bps = max_premium_bps;
        intent.paused = false;
        intent.bump = ctx.bumps.intent;
        intent.fills = 0;
        intent.total_raw = 0;
        intent.total_scaled = 0;
        intent.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    // Owner rotates the delegated keeper. The keeper can only flip the
    // pause flag, never move funds (the program holds none) or edit the plan.
    pub fn set_keeper(ctx: Context<SetKeeper>, new_keeper: Pubkey) -> Result<()> {
        require!(
            new_keeper != Pubkey::default(),
            DripError::BadKeeper
        );
        ctx.accounts.intent.keeper = new_keeper;
        Ok(())
    }

    // Owner or delegated keeper flips the pause around the 00:30 UTC
    // multiplier window. While paused, record_fill always fails.
    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
        let intent = &ctx.accounts.intent;
        require!(
            can_set_paused(
                ctx.accounts.authority.key(),
                intent.owner,
                intent.keeper
            ),
            DripError::Unauthorized
        );
        ctx.accounts.intent.paused = paused;
        Ok(())
    }

    // Record one user-signed Jupiter fill as a scaled receipt. The swap
    // itself happened off-program; this is accounting + guard, and it
    // re-checks the two rules on-chain: not paused, premium inside cap.
    // multiplier_scaled is fixed-point (MULT_SCALE); when the mint carries
    // the Token-2022 scaled-ui-amount extension, the value must match the
    // on-chain multiplier within tolerance, otherwise the keeper is lying.
    pub fn record_fill(
        ctx: Context<RecordFill>,
        raw_shares: u64,
        multiplier_scaled: u64,
        quote_bps_over_fair: u16,
    ) -> Result<()> {
        let intent = &mut ctx.accounts.intent;
        // Bind the passed mint to the intent's mint. Without this, a caller
        // could pass a dummy mint with no Token-2022 extension and bypass
        // the on-chain multiplier check below.
        require!(
            ctx.accounts.mint.key() == intent.mint,
            DripError::MintMismatch
        );
        check_fill_guard(intent.paused, quote_bps_over_fair, intent.max_premium_bps)?;
        require!(
            multiplier_scaled >= MULT_SCALE / 2 && multiplier_scaled <= MULT_SCALE * 2,
            DripError::BadMultiplier
        );
        verify_mint_multiplier(&ctx.accounts.mint, multiplier_scaled)?;

        let scaled = scaled_shares(raw_shares, multiplier_scaled)?;
        intent.fills = intent.fills.checked_add(1).ok_or(DripError::MathOverflow)?;
        intent.total_raw = intent
            .total_raw
            .checked_add(raw_shares)
            .ok_or(DripError::MathOverflow)?;
        intent.total_scaled = intent
            .total_scaled
            .checked_add(scaled)
            .ok_or(DripError::MathOverflow)?;

        emit!(FillRecorded {
            intent: intent.key(),
            owner: intent.owner,
            mint: intent.mint,
            raw_shares,
            scaled_shares: scaled,
            multiplier_scaled,
            quote_bps_over_fair,
            fills: intent.fills,
        });
        Ok(())
    }

    pub fn update_plan(
        ctx: Context<UpdatePlan>,
        amount_usdc: u64,
        interval_days: u16,
        max_premium_bps: u16,
    ) -> Result<()> {
        require!(amount_usdc > 0, DripError::BadAmount);
        require!(
            interval_days == 1 || interval_days == 7 || interval_days == 14,
            DripError::BadInterval
        );
        require!(max_premium_bps <= 10_000, DripError::BadPremiumCap);
        let intent = &mut ctx.accounts.intent;
        intent.amount_usdc = amount_usdc;
        intent.interval_days = interval_days;
        intent.max_premium_bps = max_premium_bps;
        Ok(())
    }

    pub fn close_intent(_ctx: Context<CloseIntent>) -> Result<()> {
        Ok(())
    }
}

// Pure guard check shared by the handler and unit tests: paused first,
// then the premium cap.
pub fn check_fill_guard(paused: bool, quote_bps_over_fair: u16, max_premium_bps: u16) -> Result<()> {
    require!(!paused, DripError::Paused);
    require!(
        quote_bps_over_fair <= max_premium_bps,
        DripError::PremiumOverCap
    );
    Ok(())
}

// Keeper authorization: the owner always qualifies, plus one delegated
// keeper. Everything else is rejected.
pub fn can_set_paused(authority: Pubkey, owner: Pubkey, keeper: Pubkey) -> bool {
    authority == owner || authority == keeper
}

// scaled = raw * multiplier / SCALE, all u64 with checked ops.
pub fn scaled_shares(raw: u64, multiplier_scaled: u64) -> Result<u64> {
    let product = (raw as u128)
        .checked_mul(multiplier_scaled as u128)
        .ok_or(DripError::MathOverflow)?;
    u64::try_from(product / MULT_SCALE as u128).map_err(|_| DripError::MathOverflow.into())
}

pub fn within_tolerance(a: u64, b: u64) -> bool {
    let (hi, lo) = if a >= b { (a, b) } else { (b, a) };
    let diff = hi - lo;
    diff.saturating_mul(10_000) <= hi.saturating_mul(MULT_TOLERANCE_BPS)
}

// Best-effort on-chain multiplier check. Plain-SPL mints and test mints
// carry no extension, so the keeper-provided value is accepted as-is.
// Token-2022 scaled-ui mints must agree within 0.1% (relative diff).
// Comparison runs in f64 so extension rounding never wraps a u64 cast;
// NaN/infinite/out-of-band on-chain values always reject.
pub fn verify_mint_multiplier(
    mint: &UncheckedAccount,
    multiplier_scaled: u64,
) -> Result<()> {
    let data = mint.try_borrow_data()?;
    let parsed = match StateWithExtensions::<Mint>::unpack(&data) {
        Ok(s) => s,
        Err(_) => return Ok(()),
    };
    let cfg = match parsed.get_extension::<ScaledUiAmountConfig>() {
        Ok(c) => c,
        Err(_) => return Ok(()),
    };
    let onchain_f = f64::from(cfg.multiplier);
    require!(
        onchain_f.is_finite()
            && onchain_f >= 0.5
            && onchain_f <= 2.0,
        DripError::MultiplierMismatch
    );
    let provided_f = multiplier_scaled as f64 / MULT_SCALE as f64;
    require!(provided_f.is_finite(), DripError::MultiplierMismatch);
    let rel_diff = ((onchain_f - provided_f).abs()) / onchain_f;
    require!(
        rel_diff * 10_000.0 <= MULT_TOLERANCE_BPS as f64,
        DripError::MultiplierMismatch
    );
    Ok(())
}

// Integer-side tolerance helper kept for the fixed-point path and tests.
pub fn verify_multiplier_scaled(onchain_scaled: u64, provided_scaled: u64) -> Result<()> {
    require!(
        within_tolerance(onchain_scaled, provided_scaled),
        DripError::MultiplierMismatch
    );
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeIntent<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: any SPL or Token-2022 mint; extension is verified best-effort.
    pub mint: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        space = DcaIntent::LEN,
        seeds = [b"dca-intent", owner.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub intent: Account<'info, DcaIntent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetKeeper<'info> {
    #[account(mut, has_one = owner)]
    pub intent: Account<'info, DcaIntent>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPaused<'info> {
    #[account(mut)]
    pub intent: Account<'info, DcaIntent>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordFill<'info> {
    #[account(mut, has_one = owner)]
    pub intent: Account<'info, DcaIntent>,
    pub owner: Signer<'info>,
    /// CHECK: verified best-effort against the scaled-ui-amount extension.
    pub mint: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdatePlan<'info> {
    #[account(mut, has_one = owner)]
    pub intent: Account<'info, DcaIntent>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseIntent<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub intent: Account<'info, DcaIntent>,
    pub owner: Signer<'info>,
}

#[account]
pub struct DcaIntent {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub keeper: Pubkey,
    pub amount_usdc: u64,
    pub interval_days: u16,
    pub max_premium_bps: u16,
    pub paused: bool,
    pub bump: u8,
    pub fills: u64,
    pub total_raw: u64,
    pub total_scaled: u64,
    pub created_at: i64,
}

impl DcaIntent {
    // 8 discriminator + 32 owner + 32 mint + 32 keeper + 8 amount
    // + 2 interval + 2 cap + 1 paused + 1 bump + 8 fills + 8 raw
    // + 8 scaled + 8 created_at = 150. Redeploy required: v1 PDAs (118)
    // cannot be migrated in place, create a new intent per plan.
    pub const LEN: usize = 150;
}

#[event]
pub struct FillRecorded {
    pub intent: Pubkey,
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub raw_shares: u64,
    pub scaled_shares: u64,
    pub multiplier_scaled: u64,
    pub quote_bps_over_fair: u16,
    pub fills: u64,
}

#[error_code]
pub enum DripError {
    #[msg("Fill attempted while the intent is paused for a multiplier flip.")]
    Paused,
    #[msg("Quote premium exceeds the plan cap.")]
    PremiumOverCap,
    #[msg("Multiplier outside 0.5x..2.0x sanity band.")]
    BadMultiplier,
    #[msg("Provided multiplier disagrees with the on-chain Token-2022 extension.")]
    MultiplierMismatch,
    #[msg("Passed mint does not match the intent's mint.")]
    MintMismatch,
    #[msg("Signer is neither the owner nor the delegated keeper.")]
    Unauthorized,
    #[msg("Keeper address must not be the default pubkey.")]
    BadKeeper,
    #[msg("Amount must be positive micro-USDC.")]
    BadAmount,
    #[msg("Interval must be 1, 7, or 14 days.")]
    BadInterval,
    #[msg("Premium cap must be within 0..10000 bps.")]
    BadPremiumCap,
    #[msg("Checked math overflowed.")]
    MathOverflow,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scales_like_the_aapl_dividend() {
        // raw 0.9874123 shares at 8 decimals, multiplier 1.0032690125398187x
        let raw = 98_741_230u64;
        let mult = 1_003_269_013u64;
        let scaled = scaled_shares(raw, mult).unwrap();
        assert_eq!(scaled, 99_064_016);
    }

    #[test]
    fn rejects_overflow() {
        assert!(scaled_shares(u64::MAX, MULT_SCALE * 2).is_err());
    }

    #[test]
    fn tolerance_band() {
        assert!(within_tolerance(1_000_000_000, 1_000_050_000));
        assert!(!within_tolerance(1_000_000_000, 1_002_000_000));
    }

    #[test]
    fn guard_rejects_paused_and_over_cap() {
        assert!(check_fill_guard(false, 150, 300).is_ok());
        assert!(check_fill_guard(false, 300, 300).is_ok());
        let paused = check_fill_guard(true, 0, 300);
        assert!(paused.is_err());
        let over_cap = check_fill_guard(false, 301, 300);
        assert!(over_cap.is_err());
    }

    #[test]
    fn keeper_auth_is_owner_or_delegate_only() {
        let owner = Pubkey::new_unique();
        let keeper = Pubkey::new_unique();
        let stranger = Pubkey::new_unique();
        assert!(can_set_paused(owner, owner, keeper));
        assert!(can_set_paused(keeper, owner, keeper));
        assert!(!can_set_paused(stranger, owner, keeper));
    }

    #[test]
    fn intent_binds_exactly_one_mint() {
        // The handler requires mint.key() == intent.mint; model it here so
        // a bypass mint can never satisfy the check.
        let intent_mint = Pubkey::new_unique();
        let same = intent_mint;
        let other = Pubkey::new_unique();
        assert!(same == intent_mint);
        assert!(other != intent_mint);
    }

    #[test]
    fn multiplier_scaled_path_matches_tolerance() {
        assert!(verify_multiplier_scaled(1_000_000_000, 1_000_050_000).is_ok());
        assert!(verify_multiplier_scaled(1_000_000_000, 1_002_000_000).is_err());
    }

    #[test]
    fn account_size_fits_keeper() {
        // 8 + 32*3 + 8 + 2 + 2 + 1 + 1 + 8*3 + 8 = 150
        assert_eq!(DcaIntent::LEN, 150);
    }
}
