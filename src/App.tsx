/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { createTodo, deleteTodo, getTodos, updateTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { TodoItem } from './components/TodoItem';

type Status = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    setIsLoading(true);

    getTodos(USER_ID)
      .then(setTodos)
      .catch(() => {
        setError('Unable to load todos');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const visibleTodos = todos.filter(todo => {
    if (status === 'active') {
      return !todo.completed;
    }

    if (status === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const addTodo = () => {
    const title = newTodoTitle.trim();

    if (!title) {
      setError('Title should not be empty');

      return;
    }

    const newTodo = {
      userId: USER_ID,
      title,
      completed: false,
    };

    setIsLoading(true);
    setError(null);

    createTodo(newTodo)
      .then(createdTodo => {
        setTodos(current => [...current, createdTodo]);
        setNewTodoTitle('');
      })
      .catch(() => {
        setError('Unable to add a todo');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDelete = (todoId: number) => {
    setIsLoading(true);
    setError(null);

    deleteTodo(todoId)
      .then(() => {
        setTodos(current => current.filter(todo => todo.id !== todoId));
      })
      .catch(() => {
        setError('Unable to delete a todo');
      })
      .finally(() => setIsLoading(false));
  };

  const handleClearCompleted = () => {
    setIsLoading(true);
    setError(null);

    const completed = todos.filter(todo => todo.completed);

    Promise.all(completed.map(todo => deleteTodo(todo.id)))
      .then(() => {
        setTodos(current => current.filter(todo => !todo.completed))
      })
      .catch(() => {
        setError('Unable to delete a todo');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleAll = () => {
    const completedAll = todos.every(todo => todo.completed === true);
    const newCompleteStatus = !completedAll;

    const updatePromises = todos.map(todo => {
      updateTodo({ ...todo, completed: newCompleteStatus });
    });

    setIsLoading(true);
    setError(null);

    Promise.all(updatePromises)
      .then(() => {
        setTodos(prev => {
          return prev.map(todo => ({ ...todo, completed: newCompleteStatus }));
        });
      })
      .catch(() => {
        setError('Unable to update a todo');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onToggle = (todoId) => {
    const targetTodo = todos.find(todo => todo.id === todoId);

    if (!targetTodo) {
      return;
    }

    const updatedTodo = {
      ...targetTodo,
      completed: !targetTodo.completed,
    };

    setIsLoading(true);
    setError(null);

    updateTodo(updatedTodo)
      .then(() => {
        setTodos(prev =>
          prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo)),
        );
      })
      .catch(() => {
        setError('Unable to update a todo');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form
            onSubmit={e => {
              e.preventDefault();
              addTodo();
            }}
          >
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodoTitle}
              onChange={e => setNewTodoTitle(e.target.value)}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {visibleTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isLoading={isLoading}
              onDelete={handleDelete}
              onToggle={onToggle}
            />
          ))}
        </section>

        {/* Hide the footer if there are no todos */}
        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {todos.filter(todo => !todo.completed).length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                data-cy="FilterLinkAll"
                className={`filter__link ${status === 'all' ? 'selected' : ''}`}
                onClick={() => setStatus('all')}
              >
                All
              </a>

              <a
                href="#/active"
                data-cy="FilterLinkActive"
                className={`filter__link ${status === 'active' ? 'selected' : ''}`}
                onClick={() => setStatus('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                data-cy="FilterLinkCompleted"
                className={`filter__link ${status === 'completed' ? 'selected' : ''}`}
                onClick={() => setStatus('completed')}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={!todos.some(todo => todo.completed)}
              onClick={handleClearCompleted}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${error ? '' : 'hidden'}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError(null)}
        />
        {error}
        Unable to update a todo
      </div>
    </div>
  );
};
