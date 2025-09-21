const CommentSectionSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-md shadow-md p-4 animate-pulse">
      {/* Comment input skeleton */}
      <div className="h-10 bg-gray-200 rounded-md mb-4"></div>

      {/* Comment list skeleton */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-32"></div>
            <div className="h-4 bg-gray-200 rounded-md w-48"></div>
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-32"></div>
            <div className="h-4 bg-gray-200 rounded-md w-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSectionSkeleton;