import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface DeleteAlertPopProps {
    isOpen: boolean;
    onClose: () => void;
    handleSubmit: () => void;
}

export function AlertDeleteDialog({
    isOpen,
    onClose,
    handleSubmit,
}: DeleteAlertPopProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}   >

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        data and remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300 rounded-md" onClick={handleSubmit}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
