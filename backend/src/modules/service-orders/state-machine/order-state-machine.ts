import { BadRequestException } from '@nestjs/common';
import { ServiceStatus } from '../../../common/enums';

type Transition = {
  from: ServiceStatus[];
  to: ServiceStatus;
};

const TRANSITIONS: Record<string, Transition> = {
  schedule: { from: [ServiceStatus.DRAFT], to: ServiceStatus.SCHEDULED },
  assign: { from: [ServiceStatus.DRAFT, ServiceStatus.SCHEDULED], to: ServiceStatus.ASSIGNED },
  start: { from: [ServiceStatus.ASSIGNED], to: ServiceStatus.IN_PROGRESS },
  submit: { from: [ServiceStatus.IN_PROGRESS], to: ServiceStatus.PENDING_APPROVAL },
  complete: {
    from: [ServiceStatus.IN_PROGRESS, ServiceStatus.PENDING_APPROVAL],
    to: ServiceStatus.COMPLETED,
  },
  cancel: {
    from: [
      ServiceStatus.DRAFT, ServiceStatus.SCHEDULED,
      ServiceStatus.ASSIGNED, ServiceStatus.IN_PROGRESS,
    ],
    to: ServiceStatus.CANCELLED,
  },
};

export function transition(
  current: ServiceStatus,
  action: string,
): ServiceStatus {
  const t = TRANSITIONS[action];
  if (!t) throw new BadRequestException(`Unknown action: ${action}`);
  if (!t.from.includes(current)) {
    throw new BadRequestException(
      `Cannot perform '${action}' on order in status '${current}'. Allowed from: ${t.from.join(', ')}`,
    );
  }
  return t.to;
}

export function allowedActions(current: ServiceStatus): string[] {
  return Object.entries(TRANSITIONS)
    .filter(([, t]) => t.from.includes(current))
    .map(([action]) => action);
}
