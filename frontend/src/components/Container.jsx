const Container = ({ children }) => {
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {children}
        </div>
    );
};

export default Container;