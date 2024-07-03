import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate, Link } from "react-router-dom";

const LOGIN_MUTATION = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ variables: { email, password } });
      console.log("Login response:", response);
      if (response.errors) {
        console.error("GraphQL error:", response.errors);
        // Handle GraphQL errors here
      } else if (
        response.data &&
        response.data.login &&
        response.data.login.token
      ) {
        console.log("Token received:", response.data.login.token);
        localStorage.setItem("token", response.data.login.token);
        // Log the token from localStorage
        console.log("Stored token:", localStorage.getItem("token"));
        navigate("/home");
      } else {
        console.error("Token not found in response");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      <form
        className="w-full max-w-xs bg-custom-white shadow-md rounded p-10 mb-4 border border-custom-darkwhite"
        onSubmit={handleLogin}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            className="border border-custom-darkwhite rounded w-full max-w-xs mb-4 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="border border-custom-darkwhite rounded w-full max-w-xs mb-4 p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn bg-custom-blue btn-primary w-full rounded text-custom-white p-2"
        >
          Login
        </button>
      </form>
      {error && (
        <p className="text-custom-red text-xs italic">
          Login error: {error.message}
        </p>
      )}
      {/* Add Link to Register below */}
      <div className="mt-4">
        <p className="text-center text-sm text-gray-600">
          Dont have an account?
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-700 ml-1 underline font-bold"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;