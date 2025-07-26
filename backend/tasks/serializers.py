from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import CustomUser, Project, Task
from rest_framework.fields import DateField, DateTimeField

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    date_joined = DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    confirmPassword = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'full_name', 'role', 
            'password', 'confirmPassword', 'is_active', 'date_joined'
        ]
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }

    def validate(self, data):
        if 'password' in data:
            if data.get('password') != data.get('confirmPassword'):
                raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        validated_data.pop('confirmPassword', None)
        password = validated_data.pop('password', None)
        
        if password:
            instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")
        return data

class ProjectSerializer(serializers.ModelSerializer):
    created_at = DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    deadline = DateField(format="%Y-%m-%d", required=False, allow_null=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_by', 'assigned_to', 'created_at', 'deadline']
        read_only_fields = ['created_by', 'created_at']

    def validate(self, data):
        if not data.get('name'):
            raise serializers.ValidationError("Project name is required")
        if len(data.get('name', '')) < 3:
            raise serializers.ValidationError("Project name must be at least 3 characters")
        return data

class TaskSerializer(serializers.ModelSerializer):
    created_at = DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    due_date = DateField(format="%Y-%m-%d", required=False, allow_null=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('assigned_by', 'created_at')

    def validate(self, data):
        return data

class RecentActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    timestamp = DateTimeField(format="%Y-%m-%d %H:%M:%S")
    user = serializers.CharField()
    user_role = serializers.CharField()
    status = serializers.CharField(required=False)
    action = serializers.CharField()