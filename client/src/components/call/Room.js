import { useParams } from 'react-router-dom';
import { SocketContext } from '../../Context';
import React, { useContext, useEffect, useRef } from 'react';
import {
  Grid,
  Typography,
  Paper,
  makeStyles,
  Button,
  Container,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
  paper: {
    padding: '10px',
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

const Room = ({ auth }) => {
  const { id } = useParams();

  const userId = auth.user._id;

  const {
    joinRoom,
    myVideo,
    userVideo,
    leaveRoom,
    stream,
    cameraOn,
    getMediaStream,
    toggleCamera,
  } = useContext(SocketContext);
  const classes = useStyles();

  useEffect(() => {
    getMediaStream(cameraOn);
    return () => {
      leaveRoom();
    };
  }, []);

  useEffect(() => {
    joinRoom(id, userId);
    // }
  }, [id]);

  return (
    <div>
      <Grid container className={classes.gridContainer}>
        {stream && (
          <Paper className={classes.paper}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                {'Me'}
              </Typography>
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
        {/* {userStream && ( */}
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {'user'}
            </Typography>
            <video
              playsInline
              ref={userVideo}
              autoPlay
              className={classes.video}
            />
          </Grid>
        </Paper>
        {/* )} */}
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
          </Paper>
        </Container>
      </div>
    </div>
  );
};

Room.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {})(Room);
