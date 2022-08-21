import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Paper,
  makeStyles,
  Button,
  TextField,
  Container,
} from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';

import { SocketContext } from '../../Context';

const useStyles = makeStyles((theme) => ({
  video: {
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  sidebarGridContainer: {
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  videoPaper: {
    padding: '10px',
    border: '2px solid black',
    margin: '10px',
  },
  paper: {
    padding: '10px 20px',
    border: '2px solid black',
    margin: '10px',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    width: '600px',
    margin: '35px 0',
    padding: 0,
    [theme.breakpoints.down('xs')]: {
      width: '80%',
    },
  },
  margin: {
    marginTop: 20,
  },
  padding: {
    padding: 20,
  },
}));

const PreVideoCall = ({ children }) => {
  const classes = useStyles();
  const {
    myVideo,
    stream,
    setUserIdToCall,
    cameraOn,
    getMediaStream,
    toggleCamera,
    sendRoomInvitation,
  } = useContext(SocketContext);

  const { id } = useParams();

  const [roomId, setRoomId] = useState('');

  let navigate = useNavigate();

  useEffect(() => {
    getMediaStream(cameraOn);
    setUserIdToCall(id);
  }, [id]);

  const createRoom = () => {
    const newRoomId = uuidv4();
    sendRoomInvitation(newRoomId, navigate);
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div>
      <Grid container className={classes.gridContainer}>
        {stream && (
          <Paper className={classes.videoPaper}>
            <Grid item xs={12} md={6}>
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className={classes.video}
              />
            </Grid>
          </Paper>
        )}
      </Grid>
      <div
        className="sidebar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container className={classes.container}>
          <Paper elevation={10} className={classes.paper}>
            <form className={classes.root} noValidate autoComplete="off">
              <Grid container className={classes.sidebarGridContainer}>
                <Grid item xs={12} md={6} className={classes.padding}>
                  <Typography gutterBottom variant="h6" align="center">
                    Make a call
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    //   startIcon={<Phone fontSize="large" />}
                    fullWidth
                    onClick={createRoom}
                    className={classes.margin}
                  >
                    Create Room
                  </Button>
                </Grid>
                <Grid item xs={12} md={6} className={classes.padding}>
                  <TextField
                    label="room id to join"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={joinRoom}
                    className={classes.margin}
                  >
                    Join Room
                  </Button>
                </Grid>

                <Grid item xs={12} md={6} className={classes.padding}>
                  <Typography gutterBottom variant="h6">
                    Camera
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={toggleCamera}
                    className={classes.margin}
                  >
                    {cameraOn ? 'Turn off camera' : 'Turn on camera'}
                  </Button>
                </Grid>
              </Grid>
            </form>
            {children}
          </Paper>
        </Container>
      </div>
    </div>
  );
};

// VideoCall.propTypes = {
//   isAuthenticated: PropTypes.bool,
// };

// const mapStateToProps = (state) => ({
//   isAuthenticated: state.auth.isAuthenticated,
// });

// export default connect(mapStateToProps)(VideoCall);
export default PreVideoCall;
