import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!visible) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 shadow-lg flex items-center justify-center transition hover:scale-110 active:scale-95"
            aria-label="Scroll to top"
        >
            <FaArrowUp size={16} />
        </button>
    );
};

export default ScrollToTop;
