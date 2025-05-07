import classNames from 'classnames';
import { FilterStatus } from '../../enums/enums';

type Props = {
  todosCompleted: number;
  todosActive: number;
  statusValue: FilterStatus;
  handleStatusValueChange: (statusValue: FilterStatus) => void;
};

const FILTER_LABELS: Record<FilterStatus, string> = {
  [FilterStatus.All]: 'All',
  [FilterStatus.Active]: 'Active',
  [FilterStatus.Completed]: 'Completed',
};

export const Footer: React.FC<Props> = ({
  todosCompleted,
  todosActive,
  statusValue,
  handleStatusValueChange,
}) => {
  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${todosActive} items left`}
      </span>

      <nav className="filter" data-cy="Filter">
        {Object.values(FilterStatus).map(status => (
          <a
            key={status}
            href={`#/${status === FilterStatus.All ? '' : status}`}
            className={classNames('filter__link', {
              selected: statusValue === FilterStatus.All,
            })}
            data-cy={`FilterLink${FILTER_LABELS[status]}`}
            onClick={() => handleStatusValueChange(FilterStatus.All)}
          >
            {FILTER_LABELS[status]}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!todosCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
