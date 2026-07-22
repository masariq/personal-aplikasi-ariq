import type { AppState } from '../types';
import type { Actions } from '../lib/actions';
import { TomorrowCard } from './sections/TomorrowCard';
import { ChallengeSection } from './sections/ChallengeSection';
import { HabitTracker } from './sections/HabitTracker';

export function DashboardPage({
  state,
  actions,
  onGoToAgenda,
}: {
  state: AppState;
  actions: Actions;
  onGoToAgenda: () => void;
}) {
  return (
    <div className="space-y-4">
      <TomorrowCard state={state} actions={actions} onGoToAgenda={onGoToAgenda} />
      <ChallengeSection state={state} actions={actions} />
      <HabitTracker state={state} actions={actions} />
    </div>
  );
}
