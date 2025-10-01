const Avatar = ({ username }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getColor = (name) => {
    const colors = [
      "bg-primary",
      "bg-secondary",
      "bg-accent",
      "bg-info",
      "bg-success",
      "bg-warning",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`avatar placeholder`}>
      <div
        className={`${getColor(
          username
        )} text-neutral-content rounded-full w-12`}
      >
        <span className="text-xl">{getInitials(username)}</span>
      </div>
    </div>
  );
};

export default Avatar;
