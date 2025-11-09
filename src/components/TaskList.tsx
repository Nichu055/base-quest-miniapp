import type { Task, PlayerData } from '../contractService';

interface TaskListProps {
  tasks: Task[];
  playerData: PlayerData;
  onCompleteTask: (taskId: number) => void;
  loading: boolean;
}

function TaskList({ tasks, playerData, onCompleteTask, loading }: TaskListProps) {
  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'onchain': return '⛓️';
      case 'offchain': return '🌐';
      case 'hybrid': return '🔄';
      default: return '✨';
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

      {!canCompleteMoreTasks && (
        <div className="bg-surface border border-success rounded-xl p-4 mb-4 text-center font-medium text-success">
          🎉 All tasks completed today! Come back tomorrow to continue your streak.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {tasks.map((task, index) => (
          <div key={index} className={`bg-surface border border-border rounded-xl p-4 transition-all duration-300 hover:border-primary hover:shadow-[0_4px_16px_rgba(0,82,255,0.1)] ${!task.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{getTaskIcon(task.taskType)}</span>
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
