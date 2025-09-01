import { FileText, Mail, Upload, User } from 'lucide-react';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { type AuthUser } from 'wasp/auth';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import Breadcrumb from '../../layout/Breadcrumb';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';

const SettingsPage = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const { t } = useTranslation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // TODO add toast provider / wrapper
    event.preventDefault();
    const confirmed = confirm(t('admin.areYouSure'));
    if (confirmed) {
      toast.success(t('admin.changesSaved'));
    } else {
      toast.error(t('admin.changesNotSaved'));
    }
  };

  return (
    <DefaultLayout user={user}>
      <div className='mx-auto max-w-270'>
        <Breadcrumb pageName={t('admin.settings')} />

        <div className='grid grid-cols-5 gap-8'>
          <div className='col-span-5 xl:col-span-3'>
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.personalInformation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className='mb-5.5 flex flex-col gap-5.5 sm:flex-row'>
                    <div className='w-full sm:w-1/2'>
                      <Label htmlFor='full-name' className='mb-3 block text-sm font-medium text-foreground'>
                        {t('admin.fullName')}
                      </Label>
                      <div className='relative'>
                        <User className='absolute left-4.5 top-2 h-5 w-5 text-muted-foreground' />
                        <Input
                          className='pl-11.5'
                          type='text'
                          name='fullName'
                          id='full-name'
                          placeholder='Devid Jhon'
                          defaultValue='Devid Jhon'
                        />
                      </div>
                    </div>

                    <div className='w-full sm:w-1/2'>
                      <Label
                        htmlFor='phone-number'
                        className='mb-3 block text-sm font-medium text-foreground'
                      >
                        {t('admin.phoneNumber')}
                      </Label>
                      <Input
                        type=''
                        name='phoneNumber'
                        id='phone-number'
                        placeholder='+990 3343 7865'
                        defaultValue='+990 3343 7865'
                      />
                    </div>
                  </div>

                  <div className='mb-5.5'>
                    <Label htmlFor='email-address' className='mb-3 block text-sm font-medium text-foreground'>
                      {t('common.email')}
                    </Label>
                    <div className='relative'>
                      <Mail className='absolute left-4.5 top-2 h-5 w-5 text-muted-foreground' />
                      <Input
                        className='pl-11.5'
                        type='email'
                        name='emailAddress'
                        id='email-address'
                        placeholder='devidjond45@gmail.com'
                        defaultValue='devidjond45@gmail.com'
                      />
                    </div>
                  </div>

                  <div className='mb-5.5'>
                    <Label htmlFor='username' className='mb-3 block text-sm font-medium text-foreground'>
                      {t('navigation.profile')}
                    </Label>
                    <Input
                      type='text'
                      name='Username'
                      id='username'
                      placeholder='devidjhon24'
                      defaultValue='devidjhon24'
                    />
                  </div>

                  <div className='mb-5.5'>
                    <Label htmlFor='bio' className='mb-3 block text-sm font-medium text-foreground'>
                      {t('admin.bio')}
                    </Label>
                    <div className='relative'>
                      <FileText className='absolute left-4.5 top-4 h-5 w-5 text-muted-foreground' />
                      <Textarea
                        className='w-full rounded border border-border bg-background py-3 pl-11.5 pr-4.5 text-foreground focus:border-primary focus-visible:outline-none'
                        name='bio'
                        id='bio'
                        rows={6}
                        placeholder={t('admin.writeYourBioHere')}
                        defaultValue='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere fermentum urna, eu condimentum mauris tempus ut. Donec fermentum blandit aliquet.'
                      ></Textarea>
                    </div>
                  </div>

                  <div className='flex justify-end gap-4.5'>
                    <Button variant='outline' type='submit'>
                      {t('common.cancel')}
                    </Button>
                    <Button type='submit'>{t('common.save')}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className='col-span-5 xl:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.yourPhoto')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form action='#'>
                  <div className='mb-4 flex items-center gap-3'>
                    <div className='h-14 w-14 rounded-full'>{/* <img src={userThree} alt="User" /> */}</div>
                    <div>
                      <span className='mb-1.5 text-foreground'>{t('admin.editYourPhoto')}</span>
                      <span className='flex gap-2.5'>
                        <button className='text-sm hover:text-primary'>{t('common.delete')}</button>
                        <button className='text-sm hover:text-primary'>{t('admin.update')}</button>
                      </span>
                    </div>
                  </div>

                  <div
                    id='FileUpload'
                    className='relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-background py-4 px-4 sm:py-7.5'
                  >
                    <input
                      type='file'
                      accept='image/*'
                      className='absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none'
                    />
                    <div className='flex flex-col items-center justify-center space-y-3'>
                      <span className='flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background'>
                        <Upload className='h-4 w-4 text-primary' />
                      </span>
                      <p>
                        <span className='text-primary'>{t('admin.clickToUpload')}</span> {t('admin.dragAndDrop')}
                      </p>
                      <p className='mt-1.5'>{t('admin.fileTypes')}</p>
                      <p>{t('admin.maxSize')}</p>
                    </div>
                  </div>

                  <div className='flex justify-end gap-4.5'>
                    <Button variant='outline' type='submit'>
                      {t('common.cancel')}
                    </Button>
                    <Button type='submit'>{t('common.save')}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SettingsPage;
