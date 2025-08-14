import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Helmet>
        <title>404 - Page Not Found | Recursion Explorer</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>
      
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! It looks like this algorithm path doesn't exist. 
          The recursion has reached its base case.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
          <Link to="/playground">
            <Button variant="outline">Try Playground</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 