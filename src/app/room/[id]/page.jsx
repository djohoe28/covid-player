import Player from "@/app/components/Player"
import { Container } from "@mui/material"
export default function Page({params}) {
    return (
        <Container>
            <h1>Welcome to Room #{params.id}!</h1>
            <Player></Player>
        </Container>
    )
}