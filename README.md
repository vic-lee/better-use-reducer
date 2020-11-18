# use-reducer-toolkit

Consider if you're writing a module for image navigation. For `useReducer` users
experienced in TypeScript, the following pattern should look pretty familiar:

```ts
type ImageNavAction =
    | { type: 'NAVIGATE_TO_IMAGE', payload: { imageId: string } }
    | { type: 'PREV_IMAGE' }
    | { type: 'NEXT_IMAGE' }
```

Then, in a reducer function, TypeScript can automatically deduce which action
variant one is considering. TypeScript also generates compilation errors when
the property that is being accessed does not exist:

```ts
export function imageNavReducer(prevState: NavState, action: ImageNavAction) {
    switch (action) {
        case 'NEXT_IMAGE':
            // error: no 'payload' in this action variant
            return { ...prevState, selectedImage: action.payload.imageId  }
    }
}
```

This is very nice! But all the type-checking depends on `ImageNavAction` here.
For a reducer with some additional complexity, this action type could quickly
become too large to manage. Let's consider a somewhat more involved example:
the actions for a todo list that supports nesting could look like this:

```ts
type TodoPriority = 1 | 2 | 3;

type TodoId = string;

interface Todo {
  id: TodoId;
  content: string;
  children: TodoId[];
  priority: TodoPriority;
  dueTime?: Date;
}

type TodoAction =
  | {
      type: "ADD_TODO";
      payload: {
        // make priority level optional; a default priority can be provided in
        // the reducer
        newTodo: Omit<Todo, "id | priority | children"> & {
          priority?: TodoPriority;
        };
        parentId?: TodoId;
      };
    }
  | { type: "DELETE_TODO"; payload: { todoId: TodoId } }
  | {
      type: "UPDATE_TODO";
      payload: { todoId: TodoId; update: Partial<Exclude<Todo, "children">> };
    }
  | {
      type: "NEST_TODO_UNDER_NEW_PARENT";
      payload: { todoId: TodoId; newParentId: TodoId };
    }
  | { type: "RESCHEDULE_TOMORROW" }
  | { type: "RESCHEDULE_ONE_WEEK_LATER" }
  | { type: "RESCHEDULE_ONE_MONTH_LATER" };
```

As the payload interfaces for each action become more complex, the action type
also becomes considerably longer. It will become increasingly hard to:

1. quickly glance and understand what the available actions are
2. understand and reason about each action's payload interface, in isolation
3. add new actions that live alongside existing actions

## The solution, v0.1

This library contains helper functions to organize actions in a larger reducer.
By introducing a more streamlined way to declare an action, the library helps
`useReducer` users avoid TypeScript fatigue.

```ts
enum TodoActionTypes {
  AddTodo = "ADD_TODO",
  DeleteTodo = "DELETE_TODO",
  UpdateTodo = "UPDATE_TODO",
  NestTodoUnderNewParent = "NEST_TODO_UNDER_NEW_PARENT",
  RescheduleTomorrow = "RESCHEDULE_TOMORROW",
  RescheduleOneWeekLater = "RESCHEDULE_ONE_WEEK_LATER",
  RescheduleOneMonthLater = "RESCHEDULE_ONE_MONTH_LATER",
}

const addTodo = Action(
  TodoActionTypes.AddTodo,
  payload<{
    newTodo: Omit<Todo, "id | priority | children"> & {
      priority?: TodoPriority;
    };
    parentId?: TodoId;
  }>()
);

const deleteTodo = Action(
  TodoActionTypes.DeleteTodo,
  payload<{ todoId: TodoId }>()
);

const updateTodo = Action(
  TodoActionTypes.UpdateTodo,
  payload<{ todoId: TodoId; update: Partial<Exclude<Todo, "children">> }>()
);

const nestTodoUnderNewParent = Action(
  TodoActionTypes.NestTodoUnderNewParent,
  payload<{ todoId: TodoId; newParentId: TodoId }>()
);

const rescheduleTomorrow = Action(TodoActionTypes.RescheduleTomorrow);
const rescheduleOneWeekLater = Action(TodoActionTypes.RescheduleOneWeekLater);
const rescheduleOneMonthLater = Action(TodoActionTypes.RescheduleOneMonthLater);
```

## Solution, v1

There is quite a bit of boilerplate-y code in v0.1. Most notably, one needs to
repeat the name of an action three times: one in the type enum declaration,
another in the actual type string literal, then one more in the action variable
name.

The final version of the library API will resemble some form like this:

```ts
export const actions = ActionMap({
  addTodo: payload<{
    newTodo: Omit<Todo, "id | priority | children"> & {
      priority?: TodoPriority;
    };
    parentId?: TodoId;
  }>(),

  deleteTodo: payload<{ todoId: TodoId }>(),

  updateTodo: payload<{
    todoId: TodoId;
    update: Partial<Exclude<Todo, "children">>;
  }>(),

  nestTodoUnderNewParent: payload<{ todoId: TodoId; newParentId: TodoId }>(),

  rescheduleTomorrow: nullPayload(),
  rescheduleOneWeekLater: nullPayload(),
  rescheduleOneMonthLater: nullPayload(),
});

// then one could use an action like so:
const { addTodo } = actions;

dispatch(
  addTodo({
    newTodo: {
      content: "add docs for better-use-reducer",
    },
    parent: '3127',
  })
);
```
