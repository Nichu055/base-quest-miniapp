import type { Task, PlayerData } from '../contractService';

interface TaskListProps {
  tasks: Task[];
  playerData: PlayerData;
  onCompleteTask: (taskId: number) => void;
  loading: boolean;
}

function TaskList({ tasks, playerData, onCompleteTask, loading }: TaskListProps) {
  // Show only first 5 tasks to avoid overwhelming UI
  // In production, the contract would return 3 random tasks per user per day
  const displayTasks = tasks.slice(0, 5);
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'onchain': return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
      case 'offchain': return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
      case 'hybrid': return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
      default: return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    }
  };

  const canCompleteMoreTasks = playerData.tasksCompletedToday < 3;

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Today's Quests</h2>
        <div className="bg-surface border border-border rounded-[20px] px-3.5 py-1.5 text-sm font-semibold text-primary">
          {playerData.tasksCompletedToday}/3 completed
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-text-secondary">Complete 3 tasks daily to maintain your streak. {tasks.length} total tasks available - showing 5 random daily!</span>
        </div>
      </div>

      {!canCompleteMoreTasks && (
        <div className="bg-surface border border-success rounded-xl p-4 mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-success">All Tasks Complete!</span>
          </div>
          <p className="text-sm text-text-secondary">Come back in 24 hours for new tasks to continue your streak</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {displayTasks.map((task, index) => (
          <div key={index} className={`bg-surface border border-border rounded-xl p-4 transition-all duration-300 hover:border-primary hover:shadow-[0_4px_16px_rgba(0,82,255,0.1)] ${!task.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-primary">
                {getTaskIcon(task.taskType)}
              </div>
              <span className="bg-surface-light border border-border rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {task.taskType}
              </span>
            </div>
            
            <div className="text-[15px] leading-relaxed mb-4 text-text-primary">{task.description}</div>
            
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-1.5 font-semibold text-secondary">
                <span className="text-lg">⭐</span>
                <span className="text-sm">+{Number(task.basePointsReward)} BP</span>
              </div>
              
              {task.isActive && task.taskType === 'onchain' && (
                <button
                  className="btn-primary px-4 py-2 text-sm"
                  onClick={() => onCompleteTask(index)}
                  disabled={loading || !canCompleteMoreTasks}
                >
                  {loading ? 'Processing...' : 'Complete'}
                </button>
              )}
              
              {task.taskType === 'offchain' && (
                <span className="text-xs text-text-secondary bg-surface-light px-3 py-1.5 rounded-md border border-border">
                  Verified by Attester
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center px-5 py-10 bg-surface border border-border rounded-xl">
          <p className="my-2">No tasks available for this week yet.</p>
          <p className="text-text-secondary my-2">Check back soon!</p>
        </div>
      )}
    </div>
  );
}

export default TaskList;
