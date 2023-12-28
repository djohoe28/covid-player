import { Container, Grid, Typography } from "@mui/material";
import VideoWrapper from "@/components/Room/VideoWrapper";
import ChatArea from "@/components/Room/ChatArea";
export default function Page({ params }) {
	return (
		<Container>
			{/* <Typography variant="h6">Welcome to Room #{params.id}!</Typography> */}
			<Grid
				container
				marginBottom={1}
				spacing={2}
				// direction={{xs: "column", sm: "row"}}
				width={"80vw"}
				height={"85vh"}
				sx={{
					flexDirection: {
						xs: "column",
						sm: "row",
					},
				}}
				alignItems={"center"}
				{...params}
			>
				<Grid item xs={9}>
					<VideoWrapper />
				</Grid>
				<Grid item xs={3}>
					<ChatArea />
				</Grid>
			</Grid>
		</Container>
	);
}
