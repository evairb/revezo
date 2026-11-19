
import { UserRound } from "lucide-react";

interface MembersSummaryProps {
  total: number;
}

export const MembersSummary = ({ total }: MembersSummaryProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound size={21} />
        </div>

        <div>
          <p className="text-sm text-muted">
            Membros cadastrados
          </p>

          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>
    </div>
  );
};
