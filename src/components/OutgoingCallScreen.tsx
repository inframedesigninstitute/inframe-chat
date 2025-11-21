import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Image,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCall } from '../contexts/CallContext';

const { width, height } = Dimensions.get('window');

const OutgoingCallScreen: React.FC = () => {
    const navigation = useNavigation();
    const { currentCall, endCall, callStatus } = useCall();
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        console.log('📞 ========== OUTGOING CALL SCREEN ==========');
        console.log('📞 Current Call:', currentCall);
        console.log('📞 Call Status:', callStatus);
    }, [currentCall, callStatus]);

    useEffect(() => {
        // Pulse animation for calling state
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Auto navigate to video call screen when connected
        if (callStatus === 'connected') {
            navigation.navigate('VideoCall' as never);
        }

        // Auto close when call ends
        if (callStatus === 'ended') {
            navigation.goBack();
        }
    }, [callStatus, navigation, pulseAnim]);

    const handleEndCall = async () => {
        await endCall();
        navigation.goBack();
    };

    if (!currentCall) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <View style={styles.gradientOverlay} />

            {/* Receiver Info */}
            <View style={styles.centerContent}>
                <Animated.View
                    style={[
                        styles.avatarContainer,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {currentCall.receiverName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </Animated.View>

                <Text style={styles.receiverName}>{currentCall.receiverName}</Text>
                
                <Text style={styles.statusText}>
                    {callStatus === 'calling' && 'Calling...'}
                    {callStatus === 'ringing' && 'Ringing...'}
                    {callStatus === 'connected' && 'Connected'}
                </Text>

                <View style={styles.iconRow}>
                    <Ionicons
                        name={currentCall.callType === 'video' ? 'videocam' : 'call'}
                        size={24}
                        color="#fff"
                    />
                    <Text style={styles.callTypeText}>
                        {currentCall.callType === 'video' ? 'Video Call' : 'Voice Call'}
                    </Text>
                </View>
            </View>

            {/* Call Controls */}
            <View style={styles.controls}>
                {/* End Call Button */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.endCallButton]}
                    onPress={handleEndCall}
                >
                    <Ionicons name="call" size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'linear-gradient(180deg, #16213e 0%, #0f3460 100%)',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height * 0.15,
    },
    avatarContainer: {
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#4a4e69',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
    },
    receiverName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    statusText: {
        fontSize: 18,
        color: '#b0b0b0',
        marginBottom: 20,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    callTypeText: {
        fontSize: 16,
        color: '#fff',
    },
    controls: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    controlButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    endCallButton: {
        backgroundColor: '#e74c3c',
    },
});

export default OutgoingCallScreen;

