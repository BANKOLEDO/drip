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
    // and how rich a quote may be before the guard defers.
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

    // Keeper (owner-signed in the demo) flips the pause around the 00:30 UTC
    // multiplier window. While paused, record_fill always fails.
    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
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
        require!(!intent.paused, DripError::Paused);
        require!(
            quote_bps_over_fair <= intent.max_premium_bps,
            DripError::PremiumOverCap
        );
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
// Token-2022 scaled-ui mints must agree within 0.1%.
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
    let onchain = (f64::from(cfg.multiplier) * MULT_SCALE as f64).round() as u64;
    require!(
        within_tolerance(onchain, multiplier_scaled),
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
pub struct SetPaused<'info> {
    #[account(mut, has_one = owner)]
    pub intent: Account<'info, DcaIntent>,
    pub owner: Signer<'info>,
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
    // 8 discriminator + 32 owner + 32 mint + 8 amount + 2 interval + 2 cap
    // + 1 paused + 1 bump + 8 fills + 8 raw + 8 scaled + 8 created_at
    pub const LEN: usize = 118;
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
}
