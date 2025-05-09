import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

const UpButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button 
            className={`scroll-to-top ${isVisible ? "show" : ""}`} 
            onClick={scrollToTop}
        >
            <FaArrowUp size={25} />
        </button>
    );
};

export default UpButton;