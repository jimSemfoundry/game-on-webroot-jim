import Iconify from "@/components/iconify";
import { useConquestList } from "@/hooks/api/useAuth";
import { formatConquestTasksData, type ConquestAPITask, type ConquestTask } from "@/utils/conquestDataFormatter";
import { useCallback, useMemo, useState } from "react";
import { BonusConquestsTaskCard } from "./bonus-conquests-task-card";

interface TaskColors {
  [taskId: string]: string;
}

export function   BonusConquestsSection() {
  const [taskColors, setTaskColors] = useState<TaskColors>({});

  // API hooks
  const { data: conquestListResponse, isLoading: conquestListLoading, error: conquestListError } = useConquestList();

  // Format conquest tasks
  const conquestTasks: ConquestTask[] = useMemo(() => {
    if (conquestListResponse?.code === 0 && conquestListResponse?.data && Array.isArray(conquestListResponse.data)) {
      return formatConquestTasksData(conquestListResponse.data as ConquestAPITask[]);
    }
    return [];
  }, [conquestListResponse]);

  // Handle color extraction from BonusConquestsTaskCard components
  const handleColorExtracted = useCallback((taskId: string, color: string) => {
    setTaskColors(prev => ({
      ...prev,
      [taskId]: color
    }));
  }, []);


  const handleGoClick = (taskId: string) => {
    const task = conquestTasks.find(t => t.id === taskId);
    if (!task) {
      console.log("Task not found:", taskId);
      return;
    }

    console.log("Navigating for task:", task.title, "- Type:", task.category);

    // Navigation logic based on task type
    const taskTitle = task.title.toLowerCase();
    
    if (taskTitle.includes('slots')) {
      console.log("Navigate to slots games");
    } else if (taskTitle.includes('gameshow')) {
      console.log("Navigate to live gameshows");
    } else if (taskTitle.includes('blackjack')) {
      console.log("Navigate to live blackjack");
    } else if (taskTitle.includes('baccarat')) {
      console.log("Navigate to live baccarat");
    } else if (taskTitle.includes('roulette')) {
      console.log("Navigate to live roulette");
    } else if (taskTitle.includes('wager')) {
      console.log("Navigate to casino for wagering");
    } else if (taskTitle.includes('win') && (taskTitle.includes('big') || taskTitle.includes('huge') || taskTitle.includes('massive'))) {
      console.log("Navigate to high volatility games for big wins");
    } else {
      console.log("Navigate to casino (default)");
    }
  };


  return (
    <div className="flex flex-col gap-3">


      {/* Conquest Tasks Grid */}
      {conquestListLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="loading loading-spinner loading-md"></div>
          <span className="ml-2 text-base-content/60">Loading conquest tasks...</span>
        </div>
      ) : conquestListError ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Iconify icon="mdi:alert-circle" className="w-8 h-8 text-error mb-2" />
          <p className="text-base-content/60">Failed to load conquest tasks</p>
          <p className="text-xs text-base-content/40 mt-1">Please try again later</p>
        </div>
      ) : conquestTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Iconify icon="custom:target" className="w-8 h-8 text-base-content/30 mb-2" />
          <p className="text-base-content/60">No conquest tasks available</p>
          <p className="text-xs text-base-content/40 mt-1">Check back later for new challenges</p>
        </div>
      ) : (
        <div className="sm:grid sm:grid-cols-3 sm:gap-3 flex flex-col gap-3">
          {conquestTasks.map((task) => (
            <BonusConquestsTaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              icon={task.icon}
              gradientColor={task.gradientColor}
              reward={task.reward}
              progress={task.progress}
              completed={task.completed}
              category={task.category}
              backgroundStyle={taskColors[task.id]}
              onGoClick={handleGoClick}
              onColorExtracted={handleColorExtracted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
