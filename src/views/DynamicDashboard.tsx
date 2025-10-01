import Editor from "@/components/dashboard/editor";
import { cn } from "@/lib/utils";
import Container from "@/misc/Container";
import { WidgetData } from "@/misc/dashboardLayoutMap";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useState } from "react";

// Lazy-loaded components
const DashboardHeader = lazy(
    () => import("@/components/dashboard/header.dashboard")
);
const EditHeader = lazy(
    () => import("@/components/dashboard/header.edit")
);
const Dashboard = () => {
    const [onEdit, onToggleEdit] = useState(false)
    const [widgets, setWidgets] = useState<WidgetData[]>([])

    return (
        <Container className="p-0 gap-0 px-2 pt-2">
            <AnimatePresence mode="wait">
                {!onEdit ?
                    <motion.div
                        key="default-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="p-2 pb-0"
                    >
                        <Suspense fallback={<div>Loading header...</div>}>
                            <DashboardHeader onToggleEdit={onToggleEdit} />
                        </Suspense>
                    </motion.div>
                    :
                    <motion.div
                        key="edit-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Suspense fallback={<>Loading header...</>}>
                            <EditHeader onToggleEdit={onToggleEdit} widgets={widgets} onWidgetUpdate={(widget) => setWidgets(prev => {
                                return [...prev, widget]
                            })} />
                        </Suspense>
                    </motion.div>
                }
            </AnimatePresence>
            <div className={cn("transition-all", onEdit ? "border rounded-md mt-2 overflow-auto" : "")}>
                <Editor widgets={widgets} isEditable={onEdit} setWidgets={setWidgets} onDelete={(id) => setWidgets(prev => {
                    console.log(id, prev);
                    return prev.filter(w => w.key !== id)
                })} />
            </div>
        </Container>
    )
}

export default Dashboard