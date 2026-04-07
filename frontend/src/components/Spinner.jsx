const Spinner = ({ size = "md", text = "Loading..." }) => {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizes[size]} rounded-full border-blue-200 border-t-trade-navy animate-spin`}
      />
      {text && (
        <p className="text-gray-500 text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export default Spinner;