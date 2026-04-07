import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([])
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`
    }

    return (
        <div className="min-h-screen bg-white text-black p-4">

            {/* 🔥 HOME BUTTON */}
            <IconButton 
                onClick={() => routeTo("/home")}
                className="text-black"
            >
                <HomeIcon />
            </IconButton>

            {/* 🔥 MEETINGS LIST */}
            <div className="space-y-4 mt-4">
                {
                    meetings.length !== 0 ? meetings.map((e, i) => {
                        return (
                            <Card 
                                key={i} 
                                variant="outlined"
                                className="bg-white text-black shadow-sm"
                            >
                                <CardContent>
                                    <Typography 
                                        sx={{ fontSize: 14 }} 
                                        color="text.primary"
                                    >
                                        Code: {e.meetingCode}
                                    </Typography>

                                    <Typography 
                                        sx={{ mb: 1.5 }} 
                                        color="text.primary"
                                    >
                                        Date: {formatDate(e.date)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )
                    }) : (
                        <Typography className="text-center mt-10 text-gray-500">
                            No meeting history found
                        </Typography>
                    )
                }
            </div>

        </div>
    )
}