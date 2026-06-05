from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_user_profile_photo"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="two_factor_secret",
            field=models.CharField(blank=True, default="", max_length=512),
        ),
    ]
