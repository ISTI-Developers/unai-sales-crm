import { useEffect, useState } from "react"
const Banner = () => {
    const [hasCacheData, setHasCacheData] = useState(
        localStorage.getItem("cachedBookings") === "true"
    )

    useEffect(() => {
        const handleStorage = () => {
            setHasCacheData(localStorage.getItem("cachedBookings") === "true")
        }

        // Listen for changes (from same tab or other tabs)
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    return (
        hasCacheData && (
            <div className="overflow-hidden whitespace-nowrap w-full fixed top-0 z-[100] bg-[#0000007d] hover:bg-[#000000] text-red-50 text-[0.65rem] py-1 backdrop-blur-sm text-center">
                <p

                >
                    UNIS is currently undergoing downtime. At the moment, offline data is being
                    used on the <span className="font-bold">Booking</span> and{" "}
                    <span className="font-bold">Deck</span> pages. We appreciate your patience
                    while we work to resolve this issue. Please refresh the page from time to
                    time.
                </p>
            </div>
        )
    )
}

export default Banner
