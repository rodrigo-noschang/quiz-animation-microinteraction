import AsyncStorage from "@react-native-async-storage/async-storage";

const POINTS_COLLECTION = '@ignite_quiz:points';

export async function clearCurrentPoints() {
    try {
        await AsyncStorage.removeItem(POINTS_COLLECTION);
    } catch (error) {
        throw error;
    }
}

export async function getCurrentPoints() {
    try {
        const storedAnswers = await AsyncStorage.getItem(POINTS_COLLECTION);
        
        if (!storedAnswers) return 0;
        return Number(storedAnswers);

    } catch (error) {
        throw error;
    }
}

export async function updatePoints(pointUpdate: number) {
    try {
        const currentPoints = await getCurrentPoints()
        const udpatedPoints = currentPoints + pointUpdate

        await AsyncStorage.setItem(POINTS_COLLECTION, JSON.stringify(udpatedPoints));

    } catch (error) {
        throw error;
    }
}
