import { useState } from "react";
import logoDark from "../assets/logo-dark.svg";
import logoLight from "../assets/logo-light.svg";
import Sidebar from "../components/Sidebar";
import ThreeDotMenu from "../components/ThreeDotMenu";
import { useTheme } from "../../themeContext";
import { gql, useQuery, useMutation } from "@apollo/client";
import BoardPage from "./BoardPage";

const CREATE_BOARD_MUTATION = gql`
  mutation createBoard(
    $name: String!
    $description: String!
    $columns: [ColumnInput!]!
  ) {
    createBoard(name: $name, description: $description, columns: $columns) {
      id
      name
      description
      columns {
        name
        tasks {
          title
          description
        }
      }
    }
  }
`;

const ADD_TASK_TO_COLUMN_MUTATION = gql`
  mutation addTaskToColumn(
    $boardId: ID!
    $columnName: String!
    $task: TaskInput!
  ) {
    addTaskToColumn(boardId: $boardId, columnName: $columnName, task: $task) {
      id
      name
      description
      columns {
        name
        tasks {
          title
          description
        }
      }
    }
  }
`;

const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      name
      description
      columns {
        name
        tasks {
          title
          description
        }
      }
    }
  }
`;

export default function Home() {
  const { isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [createBoard] = useMutation(CREATE_BOARD_MUTATION);
  const [addTaskToColumn] = useMutation(ADD_TASK_TO_COLUMN_MUTATION);
  const { loading, error, data, refetch } = useQuery(GET_BOARDS);
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleTaskModal = () => setIsTaskModalOpen(!isTaskModalOpen);

  const handleCreateBoard = async () => {
    if (!boardName) {
      console.error("Board name is required");
      return;
    }
    try {
      const initialColumns = [
        {
          name: "To Do", // Ensure column name is set
          tasks: [],
        },
      ];

      const response = await createBoard({
        variables: {
          name: boardName,
          description: description,
          columns: initialColumns,
        },
      });
      console.log("Board created:", response.data.createBoard);
      setIsModalOpen(false);
      setBoardName("");
      setDescription("");
      refetch();
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskDescription || !selectedBoard) {
      console.error("Task title, description, and selected board are required");
      return;
    }

    try {
      const response = await addTaskToColumn({
        variables: {
          boardId: selectedBoard.id,
          columnName: "To Do",
          task: {
            title: newTaskTitle,
            description: newTaskDescription,
          },
        },
      });

      console.log("Task added:", response.data.addTaskToColumn);

      // Atualize o estado do selectedBoard diretamente
      const updatedBoard = {
        ...selectedBoard,
        columns: selectedBoard.columns.map((column) => {
          if (column.name === "To Do") {
            return {
              ...column,
              tasks: [
                ...column.tasks,
                {
                  title: newTaskTitle,
                  description: newTaskDescription,
                },
              ],
            };
          }
          return column;
        }),
      };

      setSelectedBoard(updatedBoard);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const boards = data.boards;

  return (
    <>
      <header
        className={`${
          isDarkMode ? "bg-custom-darkgray" : "bg-custom-white"
        } text-white p-4 pl-8 border-1 border-b-custom-red`}
      >
        <div className="mx-auto flex gap-5 items-center ">
          <div className="logo min-w-[235px]">
            <img
              src={isDarkMode ? logoLight : logoDark}
              alt="Logo"
              className="h-8"
            />
          </div>
          <div className="menu-wrapper flex items-center gap-5 justify-between w-[100%]">
            <p
              className={`font-bold text-2xl ${
                isDarkMode ? "text-custom-lightgray" : "text-custom-dark"
              }`}
            >
              {selectedBoard ? selectedBoard.name : "Platform Launch"}
            </p>
            <div className="nav-links flex items-center gap-4">
              <button
                className="bg-custom-blue text-custom-white rounded-full p-3 pl-6 pr-6"
                onClick={toggleTaskModal}
              >
                Add new task
              </button>
              <ThreeDotMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="container w-full px-4">
        <div className="flex justify-left m-0 p-0">
          <Sidebar
            toggleModal={toggleModal}
            boards={boards}
            onSelectBoard={setSelectedBoard}
          />
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-custom-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                <span
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={toggleModal}
                >
                  &times;
                </span>
                <h2 className="text-xl font-bold mb-4">Create New Board</h2>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Board Name"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                />
                <textarea
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  className="bg-custom-blue text-custom-white rounded-full p-3 pl-6 pr-6"
                  onClick={handleCreateBoard}
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {isTaskModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="relative bg-custom-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                <span
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={toggleTaskModal}
                >
                  &times;
                </span>
                <h2 className="text-xl font-bold mb-4">Add New Task</h2>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Task Title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <textarea
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Task Description"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <button
                  className="bg-custom-blue text-custom-white rounded-full p-3 pl-6 pr-6"
                  onClick={handleAddTask}
                >
                  Add Task
                </button>
              </div>
            </div>
          )}
          {selectedBoard && <BoardPage board={selectedBoard} />}
        </div>
      </div>
    </>
  );
}
