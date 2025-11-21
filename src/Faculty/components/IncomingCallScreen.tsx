import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCall } from '../context/CallContext';

const { width, height } = Dimensions.get('window');

const IncomingCallScreen: React.FC = () => {
    const navigation = useNavigation();
    const { currentCall, acceptCall, rejectCall, callStatus } = useCall();
    const [pulseAnim] = useState(new Animated.Value(1));
    const [shakeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Shake animation for buttons
        Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -10,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Auto navigate when accepted
        if (callStatus === 'connected') {
            navigation.navigate('VideoCall' as never);
        }

        // Auto close when rejected/ended
        if (callStatus === 'ended') {
            navigation.goBack();
        }
    }, [callStatus, navigation, pulseAnim, shakeAnim]);

    const handleAccept = async () => {
        await acceptCall();
    };

    const handleReject = async () => {
        await rejectCall();
        navigation.goBack();
    };

    if (!currentCall) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Background */}
            <View style={styles.gradientOverlay} />

            {/* Caller Info */}
            <View style={styles.centerContent}>
                <Animated.View
                    style={[
                        styles.avatarContainer,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {currentCall.callerName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </Animated.View>

                <Text style={styles.callerName}>{currentCall.callerName}</Text>
                
                <View style={styles.iconRow}>
                    <Ionicons
                        name={currentCall.callType === 'video' ? 'videocam' : 'call'}
                        size={24}
                        color="#fff"
                    />
                    <Text style={styles.callTypeText}>
                        Incoming {currentCall.callType === 'video' ? 'Video' : 'Voice'} Call
                    </Text>
                </View>

                <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                    <Text style={styles.ringingText}>📱 Ringing...</Text>
                </Animated.View>
            </View>

            {/* Call Controls */}
            <View style={styles.controls}>
                {/* Reject Button */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.rejectButton]}
                    onPress={handleReject}
                >
                    <Ionicons name="close" size={36} color="#fff" />
                    <Text style={styles.buttonLabel}>Decline</Text>
                </TouchableOpacity>

                {/* Accept Button */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.acceptButton]}
                    onPress={handleAccept}
                >
                    <Ionicons name="call" size={36} color="#fff" />
                    <Text style={styles.buttonLabel}>Accept</Text>
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
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#4a4e69',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#fff',
    },
    callerName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    callTypeText: {
        fontSize: 18,
        color: '#fff',
    },
    ringingText: {
        fontSize: 20,
        color: '#4ecca3',
        fontWeight: '600',
        marginTop: 10,
    },
    controls: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 60,
    },
    controlButton: {
        alignItems: 'center',
        gap: 8,
    },
    rejectButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#27ae60',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default IncomingCallScreen;

