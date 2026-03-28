const Grid = ({ children }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {children}
        </div>
    );
};

export default Grid;