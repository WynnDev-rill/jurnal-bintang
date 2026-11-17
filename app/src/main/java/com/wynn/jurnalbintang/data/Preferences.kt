package com.wynn.jurnalbintang.data

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.asterPreferences by preferencesDataStore("aster_settings")
data class Settings(val theme: String="system",val protectScreen: Boolean=true,val reminder: Boolean=false,val hour: Int=20,val minute: Int=0,val oldest: Boolean=false)
class Preferences(context: Context) {
    private val store=context.asterPreferences
    private val theme=stringPreferencesKey("theme")
    private val protect=booleanPreferencesKey("protect_screen")
    private val reminder=booleanPreferencesKey("reminder")
    private val hour=intPreferencesKey("hour")
    private val minute=intPreferencesKey("minute")
    private val oldest=booleanPreferencesKey("oldest")
    val settings=store.data.catch { if(it is IOException) emit(emptyPreferences()) else throw it }.map {
        Settings(it[theme] ?: "system",it[protect] ?: true,it[reminder] ?: false,it[hour] ?: 20,it[minute] ?: 0,it[oldest] ?: false)
    }
    suspend fun update(value: Settings) {
        require(value.theme in listOf("system","light","dark"))
        require(value.hour in 0..23 && value.minute in 0..59)
        store.edit { it[theme]=value.theme;it[protect]=value.protectScreen;it[reminder]=value.reminder;it[hour]=value.hour;it[minute]=value.minute;it[oldest]=value.oldest }
    }
}
