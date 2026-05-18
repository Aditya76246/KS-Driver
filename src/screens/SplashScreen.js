import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SplashScreenBg from '../../assets/images/splashBg.png'
import KSLogo from '../../assets/icons/iconpngplain2.png';
import globalStyles from '../styles/globalStyles';
import { color } from '../styles/theme';
import CustomText from '../components/CustomText';
import ChooseLanguage from '../components/ChooseLanguage';

export default function SplashScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar style="dark" translucent backgroundColor="transparent" />
            {/* Background */}
            <ImageBackground
                source={SplashScreenBg}
                style={styles.bg}
                resizeMode="cover"
            >
                {/* Top Content */}
                <View style={styles.topContent}>
                    <Image
                        source={KSLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <CustomText style={styles.subtitle}>
                        Smart Equipment. Stronger Farms.
                    </CustomText>
                </View>

                {/* Bottom Card */}
                <View style={styles.bottomContainer}>

                    {/* Get Started Button */}
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="arrow-forward" size={20} color="#2e7d32" />
                        </View>
                        <CustomText style={styles.primaryText}>Get Started</CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.primaryBtnLang}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('ChooseLanguage')}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="globe-outline" size={20} color={color.ORANGE}/>
                        </View>
                        <CustomText style={styles.primaryText}>Choose Language</CustomText>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        </View>
    );
}

const GREEN = '#2e7d32';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    bg: {
        flex: 1,
        justifyContent: 'space-between',
    },

    topContent: {
        alignItems: 'center',
        marginTop: 240,
    },
    logo: {
        width: 240,
        height: 240,
    },
    subtitle: {
        ...globalStyles.f12Bold,
        color: '#444',
    },

    // Bottom Section
    bottomContainer: {
        backgroundColor: '#ffffffd2',
        paddingHorizontal: 40,
        paddingVertical: 30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.GREEN,
        padding: 16,
        borderRadius: 30,
        justifyContent: 'center',
        // marginBottom: 45,
        elevation: 3,
    },
    primaryBtnLang: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.ORANGE,
        padding: 16,
        borderRadius: 30,
        justifyContent: 'center',
        marginTop: 15,
        elevation: 3,
    },
    iconCircle: {
        backgroundColor: '#fff',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    primaryText: {
        color: '#fff',
        ...globalStyles.f14Bold,
    },

    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: color.GREEN,
        padding: 14,
        borderRadius: 30,
        justifyContent: 'center',
    },
    secondaryText: {
        color: color.GREEN,
        fontSize: 16,
        marginLeft: 8,
    },
});