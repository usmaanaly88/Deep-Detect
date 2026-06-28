import { BASE_URL , END_POINT } from "../config/config";

// Accept the full Asset object from react-native-image-picker
export const DetectAIImage = async (image: { uri: string, fileName?: string, type?: string }) => {
    console.log('Preparing to send image for detection:', image);
    // Log image file size if possible
    if (image.uri) {
        try {
            // Only works if react-native-fs is installed
            const path = image.uri.startsWith('file://') ? image.uri.replace('file://', '') : image.uri;
            let RNFS;
            try {
                RNFS = require('react-native-fs');
            } catch (e) {
                RNFS = null;
            }
            if (RNFS && RNFS.stat) {
                RNFS.stat(path)
                    .then((stat: any) => {
                        console.log('Image file size (bytes):', stat.size);
                    })
                    .catch((err: any) => {
                        console.log('Could not get file size:', err);
                    });
            } else {
                console.log('react-native-fs not available, cannot get file size. Image URI:', image.uri);
            }
        } catch (e) {
            console.log('Error logging file size:', e);
        }
    }
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: image.uri,
            name: image.fileName || 'image.jpg',
            type: image.type || 'image/jpeg',
        });

        const API = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
            },
            body: formData,
        };
        console.log('API Request:', API);
        const response = await fetch(`${BASE_URL}${END_POINT}`, API);
        const result = await response.json();
        console.log('API Response:', result);
        return result;
    } catch (error) {
        console.error('Error detecting AI image:', error);
        throw error;
    }
}