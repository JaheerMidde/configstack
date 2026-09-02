import type {
    DeviceContext,
    PlanLookup,
    Selection,
    ValidationError,
} from '@configstack/shared-types';

export type ValidationInput = {
    stack: DeviceContext[];
    plans: PlanLookup[];
};

export function validateConfigurationStack(input: ValidationInput): ValidationError[] {
    const errors: ValidationError[] =[];
    const planMap = new Map(input.plans.map((p) => [p.id, p]));

    const phoneCount = input.stack.filter((d) => d.deviceType === 'PHONE').length;
    if (phoneCount > 1) {
        const secondPhone = input.stack.filter((d) => d.deviceType === 'PHONE')[1];
        if (secondPhone) {
            errors.push({
                code: 'DUPLICATE_PHONE',
                deviceId: secondPhone.id,
                message: 'Only one phone line is allowed per configuration session.'
            });
        }
    }

    for (const device of input.stack) {
        if (!device.selections.variantId) {
            errors.push({
                code: 'MISSING_VARIANT',
                deviceId: device.id,
                message: `Select a variant for this ${device.deviceType.toLocaleLowerCase()}.`,
            });
        }

        if(!device.selections.planId) {
            errors.push({
                code: 'MISSING_PLAN',
                deviceId: device.id,
                message: `Select a plan for this ${device.deviceType.toLocaleLowerCase()}.`
            });
            continue
        }

        if (device.deviceType === 'WATCH' && device.selections.numberShare) {
            const phones = input.stack.filter((d) => d.deviceType === 'PHONE');
            if (phones.length === 0) {
                errors.push({
                    code: 'NUMBER_SHARE_REQUIRES_PHONE',
                    deviceId: device.id,
                    message: 'Number Share requires an eligible phone line in your configuration.'
                });
                continue
            }

            const hasEligiblePhone = phones.some((phone) => {
                const planId = phone.selections.planId;
                if (!planId) return false;
                const plan = planMap.get(planId);
                return plan?.supportsNumberShare === true;
            });

            if (!hasEligiblePhone) {
                errors.push({
                    code: 'NUMBER_SHARE_REQUIRES_ELIGIBLE_PLAN',
                    deviceId: device.id,
                    message: 'Number Share requires a phone on Premium or Unlimited plan.'
                });
            }
        }
    }

    return errors;
}

export function buildStackFromSelections(
    stack: DeviceContext[],
    selectionsByDeviceId: Record<string, Selection>,
): DeviceContext[] {
    return stack.map((device, index) => ({
        ...device,
        stackOrder: index,
        selections: selectionsByDeviceId[device.id] ?? device.selections
    }));
}
