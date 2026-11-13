
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from apps.churches.models import Church, ChurchMembership
from apps.ministries.models import Ministry, MinistryMembership


User = get_user_model()


class MinistryAPITests(APITestCase):

    def setUp(self):
        self.master = User.objects.create_superuser(
            email="master@exemplo.com",
            password="SenhaMaster123!",
        )

        self.church_admin = User.objects.create_user(
            email="admin@exemplo.com",
            password="SenhaAdmin123!",
        )

        self.ministry_admin = User.objects.create_user(
            email="lider@exemplo.com",
            password="SenhaLider123!",
        )

        self.regular_user = User.objects.create_user(
            email="usuario@exemplo.com",
            password="SenhaUsuario123!",
        )

        self.church = Church.objects.create(
            name="Igreja Central",
        )

        self.another_church = Church.objects.create(
            name="Igreja Secundária",
        )

        self.ministry = Ministry.objects.create(
            church=self.church,
            name="Louvor",
        )

        self.another_ministry = Ministry.objects.create(
            church=self.another_church,
            name="Recepção",
        )

        ChurchMembership.objects.create(
            user=self.church_admin,
            church=self.church,
            role=ChurchMembership.Role.ADMIN,
        )

        MinistryMembership.objects.create(
            user=self.ministry_admin,
            ministry=self.ministry,
            role=MinistryMembership.Role.ADMIN,
        )

        self.list_url = reverse("ministry-list")

    def test_master_can_create_ministry(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.post(
            self.list_url,
            {
                "church": self.church.pk,
                "name": "Mídia",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Ministry.objects.filter(
                church=self.church,
                name="Mídia",
            ).exists()
        )

    def test_master_can_list_all_ministries(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 3)

    def test_master_can_update_ministry(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.patch(
            reverse("ministry-detail", args=[self.ministry.pk]),
            {"name": "Louvor Atualizado"},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.ministry.refresh_from_db()

        self.assertEqual(
            self.ministry.name,
            "Louvor Atualizado",
        )

    def test_master_can_deactivate_ministry(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.delete(
            reverse("ministry-detail", args=[self.ministry.pk])
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.ministry.refresh_from_db()

        self.assertFalse(self.ministry.is_active)

    def test_church_admin_can_create_ministry_in_own_church(self):
        self.client.force_authenticate(user=self.church_admin)

        response = self.client.post(
            self.list_url,
            {
                "church": self.church.pk,
                "name": "Intercessão",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_church_admin_can_list_own_church_ministries(self):
        self.client.force_authenticate(user=self.church_admin)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 1)

        self.assertEqual(
            response.data["results"][0]["id"],
            self.ministry.pk,
        )

    def test_church_admin_cannot_access_another_church_ministry(self):
        self.client.force_authenticate(user=self.church_admin)

        response = self.client.get(
            reverse(
                "ministry-detail",
                args=[self.another_ministry.pk],
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_church_admin_cannot_delete_ministry(self):
        self.client.force_authenticate(user=self.church_admin)

        response = self.client.delete(
            reverse("ministry-detail", args=[self.ministry.pk])
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_ministry_admin_cannot_list_ministries(self):
        self.client.force_authenticate(user=self.ministry_admin)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 0)

    def test_ministry_admin_cannot_access_ministry_detail(self):
        self.client.force_authenticate(user=self.ministry_admin)

        response = self.client.get(
            reverse("ministry-detail", args=[self.ministry.pk])
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_ministry_admin_cannot_create_ministry(self):
        self.client.force_authenticate(user=self.ministry_admin)

        response = self.client.post(
            self.list_url,
            {
                "church": self.church.pk,
                "name": "Novo Ministério",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_regular_user_cannot_create_ministry(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.post(
            self.list_url,
            {
                "church": self.church.pk,
                "name": "Ministério Não Autorizado",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_regular_user_cannot_list_ministries(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 0)

    def test_unauthenticated_user_cannot_list_ministries(self):
        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )


class MinistryMembershipAPITests(APITestCase):

    def setUp(self):
        self.master = User.objects.create_superuser(
            email="master@exemplo.com",
            password="SenhaMaster123!",
        )

        self.church_admin = User.objects.create_user(
            email="admin@exemplo.com",
            password="SenhaAdmin123!",
        )

        self.ministry_admin = User.objects.create_user(
            email="lider@exemplo.com",
            password="SenhaLider123!",
        )

        self.regular_user = User.objects.create_user(
            email="usuario@exemplo.com",
            password="SenhaUsuario123!",
        )

        self.another_user = User.objects.create_user(
            email="outro@exemplo.com",
            password="SenhaOutro123!",
        )

        self.church = Church.objects.create(
            name="Igreja Central",
        )

        self.another_church = Church.objects.create(
            name="Igreja Secundária",
        )

        self.ministry = Ministry.objects.create(
            church=self.church,
            name="Louvor",
        )

        self.another_ministry = Ministry.objects.create(
            church=self.church,
            name="Recepção",
        )

        self.external_ministry = Ministry.objects.create(
            church=self.another_church,
            name="Mídia",
        )

        ChurchMembership.objects.create(
            user=self.church_admin,
            church=self.church,
            role=ChurchMembership.Role.ADMIN,
        )

        MinistryMembership.objects.create(
            user=self.ministry_admin,
            ministry=self.ministry,
            role=MinistryMembership.Role.ADMIN,
        )

        self.membership = MinistryMembership.objects.create(
            user=self.regular_user,
            ministry=self.ministry,
        )

        self.list_url = reverse("ministry-membership-list")

    def create_membership(self, user, ministry):
        return MinistryMembership.objects.create(
            user=user,
            ministry=ministry,
        )

    def test_master_can_create_membership(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.ministry.pk,
                "role": MinistryMembership.Role.MEMBER,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_master_can_list_all_memberships(self):
        self.client.force_authenticate(user=self.master)

        self.create_membership(
            self.another_user,
            self.another_ministry,
        )

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 2)

    def test_church_admin_can_create_membership(self):
        self.client.force_authenticate(user=self.church_admin)

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_church_admin_can_manage_memberships_of_all_own_ministries(self):
        self.client.force_authenticate(user=self.church_admin)

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.another_ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_church_admin_cannot_manage_external_ministry(self):
        self.client.force_authenticate(user=self.church_admin)

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.external_ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_ministry_admin_can_create_membership(self):
        self.client.force_authenticate(user=self.ministry_admin)

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_ministry_admin_can_promote_member(self):
        self.client.force_authenticate(user=self.ministry_admin)

        response = self.client.patch(
            reverse(
                "ministry-membership-detail",
                args=[self.membership.pk],
            ),
            {
                "role": MinistryMembership.Role.ADMIN,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.membership.refresh_from_db()

        self.assertEqual(
            self.membership.role,
            MinistryMembership.Role.ADMIN,
        )

    def test_ministry_admin_cannot_manage_another_ministry(self):
        self.client.force_authenticate(user=self.ministry_admin)

        external_membership = self.create_membership(
            self.another_user,
            self.another_ministry,
        )

        response = self.client.patch(
            reverse(
                "ministry-membership-detail",
                args=[external_membership.pk],
            ),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_ministry_admin_can_list_own_ministry_memberships(self):
        self.client.force_authenticate(user=self.ministry_admin)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data["results"]), 1)

    def test_regular_user_cannot_create_membership(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_duplicate_membership_is_rejected(self):
        self.client.force_authenticate(user=self.master)

        response = self.client.post(
            self.list_url,
            {
                "user": self.regular_user.pk,
                "ministry": self.ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_user_cannot_be_linked(self):
        self.client.force_authenticate(user=self.master)

        self.another_user.is_active = False
        self.another_user.save()

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_inactive_ministry_cannot_receive_membership(self):
        self.client.force_authenticate(user=self.master)

        self.another_ministry.is_active = False
        self.another_ministry.save()

        response = self.client.post(
            self.list_url,
            {
                "user": self.another_user.pk,
                "ministry": self.another_ministry.pk,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_ministry_admin_can_deactivate_membership(self):
        self.client.force_authenticate(user=self.ministry_admin)

        response = self.client.patch(
            reverse(
                "ministry-membership-detail",
                args=[self.membership.pk],
            ),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.membership.refresh_from_db()

        self.assertFalse(self.membership.is_active)

    def test_unauthenticated_user_cannot_list_memberships(self):
        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
