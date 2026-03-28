const Card = ({ children }) => {
    return (
        <div className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow transition ${className}`}>
            {children}
        </div>
    );
};

export default Card;