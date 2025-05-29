import { Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import profileService from '../services/profileService';

const UserAvatar = ({
  user,
  employee,
  size = 40,
  fontSize,
  sx = {},
  showInitials = true,
  ...props
}) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);

  // Determine profile picture URL
  let profilePictureUrl = employee?.profilePicture
    ? profileService.getProfilePictureUrl(employee.profilePicture)
    : null;





  // Determine initials
  const getInitials = () => {
    if (employee?.firstName && employee?.lastName) {
      return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`;
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Calculate font size based on avatar size
  const calculatedFontSize = fontSize || (size * 0.4);

  // Handle image loading error
  const handleImageError = () => {
    console.log('Image failed to load:', profilePictureUrl);
    setImageError(true);
  };

  // Handle image loading success
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', profilePictureUrl);
    setImageError(false);
  };

  // Determine if we should show the image or initials
  const shouldShowImage = profilePictureUrl && !imageError;

  return (
    <Avatar
      src={shouldShowImage ? profilePictureUrl : undefined}
      sx={{
        width: size,
        height: size,
        fontSize: calculatedFontSize,
        fontWeight: 'bold',
        background: shouldShowImage
          ? 'transparent'
          : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        ...sx,
      }}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...props}
    >
      {(!shouldShowImage && showInitials) && getInitials()}
    </Avatar>
  );
};

export default UserAvatar;
