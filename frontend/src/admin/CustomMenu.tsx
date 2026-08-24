import { Menu } from 'react-admin';
import { useState } from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import { List, ListItemButton, ListItemIcon, ListItemText, Collapse } from '@mui/material';

export const CustomMenu = () => {
    const [openEvents, setOpenEvents] = useState(true);

    return (
        <Menu>
            <Menu.DashboardItem />
            <Menu.ResourceItem name="users" />
            
            <ListItemButton onClick={() => setOpenEvents(!openEvents)} sx={{ pl: 2 }}>
                <ListItemIcon sx={{ minWidth: 40 }}><EventIcon /></ListItemIcon>
                <ListItemText primary="Matukio Events" />
                <ExpandMore sx={{ transform: openEvents ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
            </ListItemButton>
            
            <Collapse in={openEvents} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                    <Menu.ResourceItem name="events" />
                    <Menu.ResourceItem name="categories" />
                    <Menu.ResourceItem name="bookings" />
                </List>
            </Collapse>
            
            <Menu.ResourceItem name="newsletters" />
        </Menu>
    );
};
