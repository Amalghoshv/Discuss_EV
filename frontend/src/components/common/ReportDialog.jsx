import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  TextField,
  Box
} from '@mui/material';
import { ReportProblem } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { submitReport } from '../../store/slices/adminSlice';
import { showSnackbar, closeDialog } from '../../store/slices/uiSlice';

const REPORT_REASONS = [
  'Spam or misleading',
  'Harassment or hate speech',
  'Inappropriate content',
  'Copyright violation',
  'Other'
];

const ReportDialog = () => {
  const dispatch = useDispatch();
  const { dialog } = useSelector((state) => state.ui);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // dialog.data should contain { targetType: 'post' | 'comment' | 'user', targetId: 'uuid' }
  const isOpen = dialog.open && dialog.type === 'report';

  const handleClose = () => {
    dispatch(closeDialog());
    setTimeout(() => {
      setSelectedReason(REPORT_REASONS[0]);
      setCustomReason('');
    }, 300);
  };

  const handleSubmit = async () => {
    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
    
    if (!finalReason.trim()) {
      dispatch(showSnackbar({ message: 'Please provide a reason for reporting.', severity: 'warning' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(submitReport({
        targetType: dialog.data?.targetType || 'post',
        targetId: dialog.data?.targetId,
        reason: finalReason
      })).unwrap();
      
      dispatch(showSnackbar({ message: 'Report submitted successfully. Our moderators will review it shortly.', severity: 'success' }));
      handleClose();
    } catch (error) {
      dispatch(showSnackbar({ message: error || 'Failed to submit report', severity: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <ReportProblem /> Report Content
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
          Why are you reporting this content? Your report is anonymous.
        </Typography>
        
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            {REPORT_REASONS.map((reason) => (
              <FormControlLabel 
                key={reason} 
                value={reason} 
                control={<Radio color="error" />} 
                label={reason} 
              />
            ))}
          </RadioGroup>
        </FormControl>

        {selectedReason === 'Other' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Please provide details"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              variant="outlined"
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="error" 
          disabled={isSubmitting || (selectedReason === 'Other' && !customReason.trim())}
          startIcon={<ReportProblem />}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
