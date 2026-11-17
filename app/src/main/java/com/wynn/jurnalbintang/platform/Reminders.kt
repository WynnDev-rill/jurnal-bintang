package com.wynn.jurnalbintang.platform

import android.Manifest
import android.app.*
import android.content.*
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.wynn.jurnalbintang.*
import com.wynn.jurnalbintang.data.Settings
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import java.time.ZonedDateTime

object Reminders {
    private const val CHANNEL="daily_reflection"
    fun permitted(context: Context): Boolean =
        (Build.VERSION.SDK_INT<33 || ContextCompat.checkSelfPermission(context,Manifest.permission.POST_NOTIFICATIONS)==PackageManager.PERMISSION_GRANTED) && NotificationManagerCompat.from(context).areNotificationsEnabled()
    fun schedule(context: Context,settings: Settings) {
        val manager=context.getSystemService(AlarmManager::class.java)
        val pending=PendingIntent.getBroadcast(context,7,Intent(context,ReminderReceiver::class.java),PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        manager.cancel(pending)
        if(!settings.reminder || !permitted(context)) return
        val now=ZonedDateTime.now()
        var next=now.withHour(settings.hour).withMinute(settings.minute).withSecond(0).withNano(0)
        if(!next.isAfter(now)) next=next.plusDays(1)
        manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.toInstant().toEpochMilli(),pending)
    }
    fun notify(context: Context) {
        if(!permitted(context)) return
        val manager=context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(CHANNEL,"Waktu refleksi",NotificationManager.IMPORTANCE_DEFAULT).apply { description="Pengingat pribadi untuk menulis; tanpa isi jurnal." })
        val intent=Intent(context,MainActivity::class.java).putExtra("reflection",true).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val content=PendingIntent.getActivity(context,8,intent,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification=NotificationCompat.Builder(context,CHANNEL).setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Ada ruang untuk ceritamu").setContentText("Ambil waktu sejenak untuk menulis bersama Aster.")
            .setContentIntent(content).setAutoCancel(true).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).build()
        try { manager.notify(7,notification) } catch(_: SecurityException) { /* Permission can be revoked after the check. */ }
    }
}
class ReminderReceiver: BroadcastReceiver() {
    override fun onReceive(context: Context,intent: Intent) {
        val result=goAsync()
        val app=context.applicationContext as AsterApplication
        app.applicationScope.launch {
            try { val settings=app.preferences.settings.first();if(settings.reminder) Reminders.notify(context);Reminders.schedule(context,settings) }
            finally { result.finish() }
        }
    }
}
class BootReceiver: BroadcastReceiver() {
    override fun onReceive(context: Context,intent: Intent) {
        if(intent.action !in listOf(Intent.ACTION_BOOT_COMPLETED,Intent.ACTION_MY_PACKAGE_REPLACED)) return
        val result=goAsync();val app=context.applicationContext as AsterApplication
        app.applicationScope.launch { try { Reminders.schedule(context,app.preferences.settings.first()) } finally { result.finish() } }
    }
}
