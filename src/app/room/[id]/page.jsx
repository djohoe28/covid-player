import Player from "@/app/components/player"
export default function Page({params}) {
    return (
        <div>
            <h1>Props = ({params.id})</h1>
            <Player></Player>
        </div>
    )
}