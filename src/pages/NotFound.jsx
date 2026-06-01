import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        <div className="text-8xl text-primary font-serif">404</div>
        <h1 className="text-4xl font-serif text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
