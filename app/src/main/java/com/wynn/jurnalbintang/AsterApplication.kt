package com.wynn.jurnalbintang

import android.app.Application
import androidx.room.Room
import com.wynn.jurnalbintang.data.*
import com.wynn.jurnalbintang.platform.Reminders
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

class AsterApplication: Application() {
    val database by lazy { Room.databaseBuilder(this,AsterDatabase::class.java,"aster-native.db").build() }
    val repository by lazy { JournalRepository(database) }
    val preferences by lazy { Preferences(this) }
    val applicationScope = CoroutineScope(SupervisorJob()+Dispatchers.IO)
    override fun onCreate() {
        super.onCreate()
        applicationScope.launch {
            runCatching { Reminders.schedule(this@AsterApplication,preferences.settings.first()) }
        }
    }
}
