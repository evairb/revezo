
import { Users, UserCheck, UserX } from "lucide-react";

interface MinistryMembersSummaryProps {
  activeCount: number;
  inactiveCount: number;
}

export const MinistryMembersSummary = ({
  activeCount,
  inactiveCount,
}: MinistryMembersSummaryProps) => {
  const cards = [
    {
      title: "Total de integrantes",
      value: activeCount + inactiveCount,
      icon: Users,
    },
    {
      title: "Integrantes ativos",
      value: activeCount,
      icon: UserCheck,
    },
    {
      title: "Integrantes inativos",
      value: inactiveCount,
      icon: UserX,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.title}
              </p>

              <Icon
                size={20}
                className="text-gray-400"
              />
            </div>

            <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};
