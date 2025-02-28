import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Container from "@/misc/Container";
// import { Send } from "lucide-react";
// import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const Dashboard = () => {
  const [open, onOpenChange] = useState<boolean>(false);
  return (
    <Container>
      {/* <Dialog open={open} onOpenChange={onOpenChange}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      John Doe
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Software Engineer</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button onClick={() => onOpenChange(true)}>Edit</Button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      Jane Smith
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Product Manager</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Inactive
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DialogTrigger asChild>
                  <Button>Edit</Button>
                </DialogTrigger>
              </td>
            </tr>
          </tbody>
        </table>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea,
              earum.
            </DialogDescription>
          </DialogHeader>
          <div>
            <form>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Enter name"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="title"
                  type="text"
                  placeholder="Enter title"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="status"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
                <Button type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog> */}

      {/* <motion.div
        animate={{
          width: open ? "300px" : "100px",
          height: open ? "140px" : "40px",
        }}
        transition={{ duration: 0.3, type: "spring", damping: "15" }}
        className="shadow-lg p-2 rounded-md flex flex-col gap-4 overflow-hidden"
      >
        <motion.button
          onClick={() => onOpenChange((prev) => !prev)}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: !open ? 1 : 0,
            scale: !open ? 1 : 0,
            width:!open ? "fit-content" : "0px",
            height: !open ? "fit-content" : "0px",
          }}
          exit={{ opacity: 1, scale: 1 }}
        >
          Feedback
        </motion.button>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          <Textarea
            placeholder="Feedback"
            className="resize-none border-2 w-full"
          ></Textarea>
          <button
            type="button"
            onClick={() => onOpenChange((prev) => !prev)}
            className="flex items-center gap-2 w-fit ml-auto"
          >
            <p>Send</p>
            <Send />
          </button>
        </motion.div>
      </motion.div> */}
    </Container>
  );
};

export default Dashboard;
