import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { IconFolderCode } from "@tabler/icons-react"
import { EmptyCardProps } from "@/types/empty_card"


export function EmptyState({
    title,
    description,
    createLabel,
    createPath,
    createName,
}: EmptyCardProps) {
    const router = useRouter()

    const handleCreate = () => {
        const url = createName
            ? `${createPath}?name=${encodeURIComponent(createName)}`
            : createPath

        router.push(url)
    }

    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <IconFolderCode />
                </EmptyMedia>

                <EmptyTitle>{title}</EmptyTitle>

                {description && (
                    <EmptyDescription>{description}</EmptyDescription>
                )}
            </EmptyHeader>

            <EmptyContent className="flex-row justify-center gap-2">
                <Button onClick={handleCreate}>
                    {createLabel}
                </Button>


            </EmptyContent>
        </Empty>
    )
}
