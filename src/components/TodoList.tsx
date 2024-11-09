import Button from "./ui/Button";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal ";
import { ChangeEvent, FormEvent, useState } from "react";
import Input from "./ui/Input";
import { ITodo } from "../interfaces";
import Textarea from "./ui/Textarea";
import axiosInstance from "../config/axios.config";
import TodoSkeleton from "./TodoSkeleton";

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const [isEditModlOpen, setIsEditModlOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
  });
  const [todoToAdd, setTodoToAdd] = useState({
    title: "",
    description: "",
  });

  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isAddModlOpen, setIsAddModlOpen] = useState(false);

  const [queryVersion, setQueryVersion] = useState(1);

  const { isLoading, data } = useCustomQuery({
    // Replace todo ID with something more specific
    queryKey: ["todoLidt", `${queryVersion}`],
    url: "/users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`,
      },
    },
  });
  // const { isLoading, data } = useQuery({
  //   queryKey: ["todos"],
  //   queryFn: async () => {
  //     const {data}= await axiosInstance.get("/users/me?populate=todos", {
  //       headers: {
  //         Authorization: `Bearer ${userData.jwt}`,
  //       },
  //     });
  //     return data
  //   },
  // });

  // Handlers
  const onOpenAddModal = () => {
    setIsAddModlOpen(true);
  };
  const onCloseAddModal = () => {
    setTodoToAdd({
      title: "",
      description: "",
    });
    setIsAddModlOpen(false);
  };

  const onCloseEditModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
    });
    setIsEditModlOpen(false);
  };
  const onOpenEditModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsEditModlOpen(true);
  };

  const closeConfirmModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
    });
    setIsOpenConfirmModal(false);
  };
  const openConfirmModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsOpenConfirmModal(true);
  };

  const onChangeHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = evt.target;
    setTodoToEdit({
      ...todoToEdit,
      [name]: value,
    });
  };
  const onChangeAddTodoHandler = (
    evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, name } = evt.target;
    setTodoToAdd({ ...todoToAdd, [name]: value });
  };

  const onRemove = async () => {
    try {
      const { status } = await axiosInstance.delete(`/todos/${todoToEdit.id}`, {
        headers: {
          Authorization: `Bearer ${userData.jwt}`,
        },
      });
      if (status === 200) {
        closeConfirmModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setIsUpdating(true);

    // Update todo
    const { title, description } = todoToEdit;
    try {
      const { status } = await axiosInstance.put(
        `/todos/${todoToEdit.id}`,
        { data: { title, description } },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseEditModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onSubmitAddTodo = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setIsUpdating(true);

    // Update todo
    const { title, description } = todoToAdd;
    try {
      const { status } = await axiosInstance.post(
        `/todos`,

        {
          data: { title, description, user: [userData.user.id] },
        },
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );
      if (status === 200) {
        onCloseAddModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <div className="space-y-1 p-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <TodoSkeleton key={idx} />
        ))}
      </div>
    );

  return (
    <div className="space-y-1">
      <div className="flex w-fit mx-auto my-10">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-20 h-9 bg-gray-300 rounded-md dark:bg-gray-400 "></div>
            <div className="w-20 h-9 bg-gray-300 rounded-md dark:bg-gray-400 "></div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="default" onClick={onOpenAddModal} size={"sm"}>
              Post new todo
            </Button>
            <Button variant="outline" onClick={() => {}} size={"sm"}>
              Post new todo
            </Button>
          </div>
        )}
      </div>
      {data.todos.length ? (
        data.todos.map((todo: ITodo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
          >
            <p className="w-full font-semibold">
              {todo.id} - {todo.title}
            </p>
            <div className="flex items-center justify-end space-x-3 w-full">
              <Button
                onClick={() => {
                  onOpenEditModal(todo);
                }}
                size={"sm"}
              >
                Edit
              </Button>
              <Button
                onClick={() => openConfirmModal(todo)}
                variant={"danger"}
                size={"sm"}
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <h3>No todos yet!</h3>
      )}

      {/* Add Todo Modal */}
      <Modal
        isOpen={isAddModlOpen}
        closeModal={onCloseAddModal}
        title="Add a new todo"
      >
        <form className="space-y-3" onSubmit={onSubmitAddTodo}>
          <Input
            name="title"
            value={todoToAdd.title}
            onChange={onChangeAddTodoHandler}
          />
          <Textarea
            name="description"
            value={todoToAdd.description}
            onChange={onChangeAddTodoHandler}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              className="bg-indigo-700 hover:bg-indigo-800"
              isLoading={isUpdating}
            >
              Done
            </Button>
            <Button type="button" variant={"cancel"} onClick={onCloseAddModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit Todo */}
      <Modal
        isOpen={isEditModlOpen}
        closeModal={onCloseEditModal}
        title="Edit this todo"
      >
        <form className="space-y-3" onSubmit={submitHandler}>
          <Input
            name="title"
            value={todoToEdit.title}
            onChange={onChangeHandler}
          />
          <Textarea
            name="description"
            value={todoToEdit.description}
            onChange={onChangeHandler}
          />
          <div className="flex items-center space-x-3 mt-4">
            <Button
              className="bg-indigo-700 hover:bg-indigo-800"
              isLoading={isUpdating}
            >
              Update
            </Button>
            <Button type="button" variant={"cancel"} onClick={onCloseEditModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete todo Modal */}
      <Modal
        isOpen={isOpenConfirmModal}
        closeModal={closeConfirmModal}
        title="Are you sure you want to remove this todo from your store ?"
        description="Deleting this todo will remove it permenantly from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action."
      >
        <div className="flex items-center space-x-3 mt-4">
          <Button variant="danger" onClick={onRemove}>
            Yes , Remove
          </Button>
          <Button variant="cancel" type="button" onClick={closeConfirmModal}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default TodoList;
