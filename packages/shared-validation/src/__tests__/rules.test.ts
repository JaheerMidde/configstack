import type { DeviceContext } from '@configstack/shared-types';
import { validateConfigurationStack } from '../index';

const plans = [
  { id: 'plan-basic', supportsNumberShare: false },
  { id: 'plan-plus', supportsNumberShare: false },
  { id: 'plan-premium', supportsNumberShare: true },
  { id: 'plan-unlimited', supportsNumberShare: true },
];

function device(
  id: string,
  deviceType: DeviceContext['deviceType'],
  selections: DeviceContext['selections'],
  stackOrder = 0,
): DeviceContext {
  return { id, deviceType, stackOrder, selections };
}

describe('validateConfigurationStack', () => {
  it('returns no errors for valid watch+phone with premium', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-premium' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-plus', numberShare: true }, 1),
    ];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('returns NUMBER_SHARE_REQUIRES_PHONE when watch has number share without phone', () => {
    const stack = [
      device('watch-1', 'WATCH', { variantId: 'v1', planId: 'plan-plus', numberShare: true }),
    ];
    const errors = validateConfigurationStack({ stack, plans });
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('NUMBER_SHARE_REQUIRES_PHONE');
    expect(errors[0].deviceId).toBe('watch-1');
  });

  it('returns NUMBER_SHARE_REQUIRES_ELIGIBLE_PLAN when phone has basic plan', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-basic' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-plus', numberShare: true }, 1),
    ];
    const errors = validateConfigurationStack({ stack, plans });
    expect(errors.some((e) => e.code === 'NUMBER_SHARE_REQUIRES_ELIGIBLE_PLAN')).toBe(true);
  });

  it('allows tablet-only stack', () => {
    const stack = [device('tablet-1', 'TABLET', { variantId: 'v1', planId: 'plan-basic' })];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('returns MISSING_PLAN when plan not selected', () => {
    const stack = [device('phone-1', 'PHONE', { variantId: 'v1' })];
    const errors = validateConfigurationStack({ stack, plans });
    expect(errors.some((e) => e.code === 'MISSING_PLAN')).toBe(true);
  });

  it('returns MISSING_VARIANT when variant not selected', () => {
    const stack = [device('phone-1', 'PHONE', { planId: 'plan-basic' })];
    const errors = validateConfigurationStack({ stack, plans });
    expect(errors.some((e) => e.code === 'MISSING_VARIANT')).toBe(true);
  });

  it('returns DUPLICATE_PHONE when two phones in stack', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-basic' }, 0),
      device('phone-2', 'PHONE', { variantId: 'v2', planId: 'plan-plus' }, 1),
    ];
    const errors = validateConfigurationStack({ stack, plans });
    expect(errors.some((e) => e.code === 'DUPLICATE_PHONE')).toBe(true);
  });

  it('allows phone with unlimited plan for number share watch', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-unlimited' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-basic', numberShare: true }, 1),
    ];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('allows watch without number share on any plan', () => {
    const stack = [device('watch-1', 'WATCH', { variantId: 'v1', planId: 'plan-basic' })];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('validates phone -> watch -> tablet path', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-premium' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-plus', numberShare: true }, 1),
      device('tablet-1', 'TABLET', { variantId: 'v3', planId: 'plan-basic' }, 2),
    ];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('validates watch -> phone path when phone added later with eligible plan', () => {
    const stack = [
      device('watch-1', 'WATCH', { variantId: 'v1', planId: 'plan-plus', numberShare: true }, 0),
      device('phone-1', 'PHONE', { variantId: 'v2', planId: 'plan-premium' }, 1),
    ];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('fails watch-first number share before phone configured', () => {
    const stack = [
      device('watch-1', 'WATCH', { variantId: 'v1', planId: 'plan-plus', numberShare: true }, 0),
    ];
    expect(validateConfigurationStack({ stack, plans })[0].code).toBe('NUMBER_SHARE_REQUIRES_PHONE');
  });

  it('fails when phone exists but plan missing for number share', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-plus', numberShare: true }, 1),
    ];
    const errors = validateConfigurationStack({ stack, plans });
    expect(errors.some((e) => e.code === 'MISSING_PLAN')).toBe(true);
    expect(errors.some((e) => e.code === 'NUMBER_SHARE_REQUIRES_ELIGIBLE_PLAN')).toBe(true);
  });

  it('returns multiple errors for incomplete tablet config', () => {
    const stack = [device('tablet-1', 'TABLET', {})];
    const errors = validateConfigurationStack({ stack, plans });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('does not require number share for tablet', () => {
    const stack = [device('tablet-1', 'TABLET', { variantId: 'v1', planId: 'plan-basic' })];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('validates three-device stack with one phone max', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-premium' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-plus' }, 1),
      device('tablet-1', 'TABLET', { variantId: 'v3', planId: 'plan-basic' }, 2),
    ];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('phone with plus plan does not satisfy number share', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-plus' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-plus', numberShare: true }, 1),
    ];
    expect(
      validateConfigurationStack({ stack, plans }).some(
        (e) => e.code === 'NUMBER_SHARE_REQUIRES_ELIGIBLE_PLAN',
      ),
    ).toBe(true);
  });

  it('number share false on watch skips phone requirement', () => {
    const stack = [
      device('watch-1', 'WATCH', { variantId: 'v1', planId: 'plan-basic', numberShare: false }),
    ];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('structured errors include deviceId and message', () => {
    const stack = [
      device('watch-1', 'WATCH', { variantId: 'v1', planId: 'plan-plus', numberShare: true }),
    ];
    const error = validateConfigurationStack({ stack, plans })[0];
    expect(error).toMatchObject({
      code: expect.any(String),
      deviceId: 'watch-1',
      message: expect.any(String),
    });
  });

  it('validates phone -> tablet -> watch reorder', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-unlimited' }, 0),
      device('tablet-1', 'TABLET', { variantId: 'v2', planId: 'plan-basic' }, 1),
      device('watch-1', 'WATCH', { variantId: 'v3', planId: 'plan-plus', numberShare: true }, 2),
    ];
    expect(validateConfigurationStack({ stack, plans })).toEqual([]);
  });

  it('returns error on second phone in three-device stack', () => {
    const stack = [
      device('phone-1', 'PHONE', { variantId: 'v1', planId: 'plan-basic' }, 0),
      device('watch-1', 'WATCH', { variantId: 'v2', planId: 'plan-plus' }, 1),
      device('phone-2', 'PHONE', { variantId: 'v3', planId: 'plan-plus' }, 2),
    ];
    expect(validateConfigurationStack({ stack, plans }).some((e) => e.code === 'DUPLICATE_PHONE')).toBe(
      true,
    );
  });
});
