import { useGetAccountsQuery, type Account } from '@/storage/slices/api';
import { 
    Container, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemIcon,
    Chip, 
    CircularProgress, 
    Alert,
    Box,
    Divider
} from '@mui/material';
import { 
    ManageAccounts as AccountsIcon, 
    Person as PersonIcon, 
    AdminPanelSettings as AdminIcon 
} from '@mui/icons-material';

export default function AccountsPage() {
    const { data: items, error, isLoading } = useGetAccountsQuery();
    
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Page Header (Always Visible) */}
        <Box 
        sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3 
        }}>
        <AccountsIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" noWrap component="h1" sx={{ fontWeight: 'bold' }}>
        Accounts
        </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {isLoading && (
            <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '30vh' 
            }}
            >
            <CircularProgress size={40} />
            </Box>
        )}
        
        {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
            An error occurred while loading accounts data.
            </Alert>
        )}
        
        {!isLoading && !error && items && (
            <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            {items.map((item: Account, index) => (
                <Box key={item.username}>
                    <ListItem 
                        sx={{ py: 1.5 }}
                        secondaryAction={
                            item.isAdmin && (
                                <Chip 
                                    icon={<AdminIcon />} 
                                    label="Admin" 
                                    color="error" 
                                    size="small" 
                                    variant="outlined" />
                            )}>
                    
                        <ListItemIcon>
                            <PersonIcon color={item.isAdmin ? "error" : "action"} />
                        </ListItemIcon>
                    
                        <ListItemText 
                            primary={item.displayName} 
                            secondary={`${item.domainOrMachine}\\${item.username}`} />
                    </ListItem>
                    
                    {index < items.length - 1 && <Divider component="li" />}
                </Box>
            ))}
            </List>
        )}
        </Container>
    );
}